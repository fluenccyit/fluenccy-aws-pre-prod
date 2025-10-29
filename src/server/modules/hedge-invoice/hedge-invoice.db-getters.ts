import { map } from 'lodash';
import { GqlSupportedCurrency } from '@graphql';
import { dbService, errorService } from '@server/common';
import { invoiceService } from '@server/invoice';
import { HedgeRate, InvoiceDbo, RatesDbo, BuyingScheduleDbo ,RecurringPlanDbo} from '../hedge-invoice/hedge-invoice.model'
import { XeroInvoiceStatus, XeroInvoiceType } from '@server/xero';
import moment from "moment";
import { organisationResource } from '@server/organisation';
import { RateModel, rateResource } from '@server/rate';
import { sharedDateTimeService } from '@shared/common/services/shared-date-time.service';
import { query } from 'winston';

type QueryInvoiceParam = {
  tenantId: string;
  invoiceStatus: XeroInvoiceStatus;
  invoiceType: XeroInvoiceType;
  currencyCode: GqlSupportedCurrency;
  dateTo: Date;
};

type GetInvoiceByIdParam = {
  invoiceId: string;
  tenantId: string;
};

class HedgeInvoiceDbGetters {
  async getHedgeInvoices(orgId: string, tenantId: string, currency: string, filter: string) {
    try {
      
      var qry = dbService.table('hedge_invoice').select().where({ 'tenantId': tenantId });
      if(currency != '' && currency != undefined && currency != 'ALL') {
        qry.where({'currencyCode': currency});
      }

      if(filter != '' && filter != undefined) {
        const date = moment().add(filter, 'months').format('YYYY-MM-DD');
        const currentDate = moment().format('YYYY-MM-DD');
        qry.where('dateDue', '<=', date);
        // qry.where('dateDue', '>=', currentDate);
      }

      qry.where({'isAddedToBucket': false});
      qry.orderBy('dateDue', 'asc');
      const invoiceDbos: InvoiceDbo[] = await qry;

      if (!invoiceDbos) {
        return null;
      }

      return invoiceDbos;
      
    } catch (error) {
      throw errorService.handleDbError('getHedgeInvoices', error);
    }
  }

  async getInvoices(orgId: string, tenantId: string, currency: string, filter: string, type:string, isApproved: boolean = false, isPricing: boolean= false, view:string, mode: string|null, homeCurrencyCode: string | null) {
    try {
      
      var qry = dbService.table('hedge_invoice').select().where({ 'tenantId': tenantId });
      if(currency != '' && currency != undefined && currency != 'ALL') {
        qry.where({'currencyCode': currency});
      }

      if(homeCurrencyCode != '' && homeCurrencyCode != undefined && homeCurrencyCode != 'ALL') {
        qry.where({'homeCurrencyCode': homeCurrencyCode});
      }

      if(filter != '' && filter != undefined) {
        const date = moment().add(filter, 'months').format('YYYY-MM-DD');
        const currentDate = moment().format('YYYY-MM-DD');
        qry.where('dateDue', '<=', date);
      }

      qry.where({'isAddedToBucket': false});
      
      if( mode == 'receivables' ) {
        qry.where({isMarkedAsReceived: false});
      } else {
        qry.where({isMarkedAsPaid: false});
      }
      qry.where({'type': type});
      qry.where({'mode': mode});
      if (isApproved) {
        qry.where({'isApproved': isApproved});
      }
      if (view === 'feedback') {
        qry.where({'isPricing': isPricing});
      }
      qry.orderBy('dateDue', 'asc');
      const invoiceDbos: InvoiceDbo[] = await qry;

      if (!invoiceDbos) {
        return null;
      }

      var invoices = invoiceDbos;

      if( type == 'managed' ) {
        for( let i = 0; i < invoices.length; i++ ) {
          const invoice = invoices[i];
  
          var bQuery = dbService.table( 'buying_schedule' ).select().where({ 'invoiceId': invoice.invoiceId });
          const buyingScheduleDbos: BuyingScheduleDbo[] = await bQuery;
  
          invoices[i].buyingSchedule = buyingScheduleDbos[0];
        }
      }

      return invoices;
      
    } catch (error) {
      console.log('error ', error)
      throw errorService.handleDbError('getHedgeInvoices', error);
    }
  }

  async getArchivedInvoices(orgId: string, tenantId: string, currency: string, filter: string, mode:string|null, isPricing:boolean = false) {
    try {
      
      var qry = dbService.table('hedge_invoice').select().where({ 'tenantId': tenantId, 'isPricing': isPricing });
      if(currency != '' && currency != undefined && currency != 'ALL') {
        qry.where({'currencyCode': currency});
      }

      if(filter != '' && filter != undefined) {
        const date = moment().add(filter, 'months').format('YYYY-MM-DD');
        const currentDate = moment().format('YYYY-MM-DD');
        qry.where('dateDue', '<=', date);
      }

      qry.where({'isAddedToBucket': false});

      if (mode) {
        qry.where({isMarkedAsReceived: true});
      }else {
        qry.where({isMarkedAsPaid: true});
      }
      qry.where({'mode': mode});
      qry.orderBy('dateDue', 'asc');
      const invoiceDbos: InvoiceDbo[] = await qry;

      if (!invoiceDbos) {
        return null;
      }

      return invoiceDbos;
      
    } catch (error) {
      throw errorService.handleDbError('getHedgeInvoices', error);
    }
  }

  async getInvoiceDetails(invoiceId: string) {
    try {
      
      var qry = dbService.table('hedge_invoice').select().where({ 'invoiceId': invoiceId });
      const invoiceDbos: InvoiceDbo[] = await qry;

      if (!invoiceDbos) {
        return null;
      }

      var invoiceDetails = invoiceDbos[0];

      var bQuery = dbService.table( 'buying_schedule' ).select().where({ 'invoiceId': invoiceId });
      const buyingScheduleDbos: BuyingScheduleDbo[] = await bQuery;

      // if( !buyingScheduleDbos ) {

      // } else {
        invoiceDetails.buyingSchedule = buyingScheduleDbos[0];
      // }

      return invoiceDetails;
      
    } catch (error) {
      throw errorService.handleDbError('getHedgeInvoices', error);
    }
  }

  //Get details of the approved invoices
  async getApprovedInvoiceDetails(invoiceId: string) {
    try {
      
      var qry = dbService.table('hedge_invoice').select().where({ 'invoiceId': invoiceId ,'isApproved':true});
      const invoiceDbos: InvoiceDbo[] = await qry;

      if (!invoiceDbos) {
        return null;
      }

      var approvedInvoiceDetails = invoiceDbos[0];

      var bQuery = dbService.table( 'buying_schedule' ).select().where({ 'invoiceId': invoiceId });
      const buyingScheduleDbos: BuyingScheduleDbo[] = await bQuery;

      // if( !buyingScheduleDbos ) {

      // } else {
        approvedInvoiceDetails.buyingSchedule = buyingScheduleDbos[0];
      // }
      return approvedInvoiceDetails;
      
    } catch (error) {
      throw errorService.handleDbError('getApprovedHedgeInvoices', error);
    }
  }

  async getHedgeCurrencies(tenantId: string, orgId: string, mode: string) {
    try {
      
      var qry = dbService.table('hedge_invoice').select('currencyCode', 'homeCurrencyCode').where({ 'tenantId': tenantId, 'mode': mode });
      qry.groupBy('currencyCode', 'homeCurrencyCode');
      const invoiceDbos: InvoiceDbo[] = await qry;

      var returnRes: HedgeRate[] = [];

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
      throw errorService.handleDbError('getHedgeCurrencies', error);
    }
  }

  async getHedgeHomeCurrencies(tenantId: string, orgId: string, mode: string) {
    try {
      
      var qry = dbService.table('hedge_invoice').distinct().select('homeCurrencyCode').where({ 'tenantId': tenantId, 'mode': mode });
      const records = await qry;
      return records.map(r =>r.homeCurrencyCode);
    } catch (error) {
      throw errorService.handleDbError('getHedgeCurrencies', error);
    }
  }

  async getRecurringPlans(orgId:string, mode:string) {
    try {
      const recurringPlanDbos: RecurringPlanDbo[] = await dbService
        .table('recurring_plan')
        .select('id','orgId','endDate','capVolume','manageType','approvalMethod','company','currency','created_at', 'updated_at')
        .where("orgId", orgId )
        .where("mode", mode)
        .orderBy('updated_at', 'desc');

      return recurringPlanDbos;
    } catch (error) {
      console.log('error ', error)
      throw errorService.handleDbError('getRecurringPlans', error);
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

export const invoiceDbGetters = new HedgeInvoiceDbGetters();
