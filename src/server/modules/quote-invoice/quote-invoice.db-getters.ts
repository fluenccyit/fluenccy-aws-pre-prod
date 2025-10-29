import { dbService, errorService } from '@server/common';
import { QuoteRate, InvoiceDbo} from '../quote-invoice/quote-invoice.model'
import { organisationResource } from '@server/organisation';
import { RateModel, rateResource } from '@server/rate';
import moment from "moment";

class QuoteInvoiceDbGetters {
  async getInvoices(orgId: string, tenantId: string, currency: string, filter: string, type:string, isApproved: boolean = false, isPricing: boolean = false, view:string, mode: string|null, homeCurrencyCode: string | null, movedTo: string | null = null) {
    try {
      
      var qry = dbService.table('quote_invoice').select("quote_invoice.*").where({ 'quote_invoice.tenantId': tenantId });
      if(currency != '' && currency != undefined && currency != 'ALL') {
        qry.where({'quote_invoice.currencyCode': currency});
      }

      if(homeCurrencyCode != '' && homeCurrencyCode != undefined && homeCurrencyCode != 'ALL') {
        qry.where({'quote_invoice.homeCurrencyCode': homeCurrencyCode});
      }

      if(filter != '' && filter != undefined) {
        const date = moment().add(filter, 'months').format('YYYY-MM-DD');
        qry.where('quote_invoice.dateDue', '<=', date);
      }
      if (movedTo) {
        qry.where("quote_invoice.movedTo", movedTo);
      }

      // special case for archieved
      if (type === 'archieved') {
        qry.where({'quote_invoice.type': 'managed'}).leftJoin("hedge_invoice", "hedge_invoice.invoiceId", "quote_invoice.movedToId");
        if (mode) {
          qry.where("hedge_invoice.isMarkedAsReceived",true);
        } else {
          qry.where("hedge_invoice.isMarkedAsPaid",true);
        }
      } else if (type) {
        qry.where({'quote_invoice.type': type});
      }
      qry.where({'quote_invoice.mode': mode});
      qry.orderBy('quote_invoice.dateDue', 'asc');
      const invoiceDbos: InvoiceDbo[] = await qry;

      if (!invoiceDbos) {
        return null;
      }

      return invoiceDbos;
      
    } catch (error) {
      throw errorService.handleDbError('getQuoteInvoices', error);
    }
  }

  async getInvoiceDetails(invoiceId: string) {
    try {
      
      var qry = dbService.table('quote_invoice').select().where({ 'invoiceId': invoiceId });
      const invoiceDbos: InvoiceDbo[] = await qry;

      if (!invoiceDbos) {
        return null;
      }

      var invoiceDetails = invoiceDbos[0];

      return invoiceDetails;
      
    } catch (error) {
      throw errorService.handleDbError('getQuoteInvoices', error);
    }
  }

  async getQuoteCurrencies(tenantId: string, orgId: string, mode: string) {
    try {
      
      var qry = dbService.table('quote_invoice').select('currencyCode', 'homeCurrencyCode').where({ 'tenantId': tenantId, 'mode': mode });
      qry.groupBy('currencyCode', 'homeCurrencyCode');
      const invoiceDbos: InvoiceDbo[] = await qry;

      var returnRes: QuoteRate[] = [];

      if (!invoiceDbos) {
        return null;
      }
      
      const organisationDbo = await organisationResource.getOrganisationDboById(orgId);

      for(const tradeCurrency of invoiceDbos) {
        let baseCurrency = organisationDbo.currency;
        if (mode) {
          baseCurrency = tradeCurrency.homeCurrencyCode;
        }
        console.log("currency", tradeCurrency.currencyCode, ' ||| Org ', organisationDbo.currency);

        let a = dbService.table('rate').select('date').where({ 'baseCurrency': baseCurrency, 'tradeCurrency': tradeCurrency.currencyCode });
        a.limit(89);
        a.orderBy('date', 'desc');
        const resA = await a;
        let nestedRates:RateModel[] = [];
        if (resA.length) {
          let nestedQry = dbService.table('rate').select('last').where({ 'baseCurrency': baseCurrency, 'tradeCurrency': tradeCurrency.currencyCode });
          nestedQry.orderBy('date', 'asc');
          nestedQry.where('date', '>=', resA[resA.length-1].date);
          nestedRates = await nestedQry;
        }

        returnRes.push({ currencyCode: tradeCurrency.currencyCode.toString(), rates: nestedRates, currencyPair: `${baseCurrency}${tradeCurrency.currencyCode}` });
      }

      return returnRes;
      
    } catch (error) {
      throw errorService.handleDbError('getQuoteCurrencies', error);
    }
  }

  async getQuoteHomeCurrencies(tenantId: string, orgId: string, mode: string) {
    try {
      
      var qry = dbService.table('quote_invoice').distinct().select('homeCurrencyCode').where({ 'tenantId': tenantId, 'mode': mode });
      const records = await qry;
      return records.map(r =>r.homeCurrencyCode);
    } catch (error) {
      throw errorService.handleDbError('getQuoteCurrencies', error);
    }
  }

  async qyeryMarketRates89(baseCurrency : any, tradeCurrency : any) {
    let a = dbService.table('rate').select('date').where({ 'baseCurrency': baseCurrency, 'tradeCurrency': tradeCurrency });
    a.limit(89);
    a.orderBy('date', 'desc');
    const resA = await a;

    let nestedQry = dbService.table('rate').select('last').where({ 'baseCurrency': baseCurrency, 'tradeCurrency': tradeCurrency });
    nestedQry.orderBy('date', 'asc');
    nestedQry.where('date', '>=', resA[resA.length-1].date);
    const nestedRates: RateModel[] = await nestedQry;

    return nestedRates;
  }
}

export const invoiceDbGetters = new QuoteInvoiceDbGetters();
