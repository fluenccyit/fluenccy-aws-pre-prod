import { errorService, dbService } from '@server/common';
import { InvoiceDbo } from '@server/invoice';

class QuoteInvoiceDbUpdater {
  async updateInvoice(invoiceId: string,invoice: InvoiceDbo) {
    try {
      await dbService.table('quote_invoice')
      .where('invoiceId', invoiceId)
      .update(invoice)
    } catch (error) {
      throw errorService.handleDbError('quote_invoice', error);
    }
  }

  async manage(invoiceId:any, record: object, movedToId: string) {
    try {
      await dbService.table('quote_invoice')
        .where('invoiceId', invoiceId)
        .update({...record, movedToId});
    } catch( error ) {
      throw errorService.handleDbError('quote_invoice', error);
    }
  }

  async delete(invoiceIds:string[]) {
    try {
      const quoteInvoices = await dbService.table('quote_invoice')
      .whereIn('invoiceId', invoiceIds).select("movedToId");
      const movedToIds = quoteInvoices.map(inv=> inv.movedToId).filter(id=> !!id);
      // delete record from hedge invoice and payments
      await dbService.table('payment').whereIn("invoiceId", movedToIds).delete();
      await dbService.table('hedge_invoice').whereIn("invoiceId", movedToIds).delete();
      await dbService.table('quote_invoice')
        .delete()
        .whereIn('invoiceId', invoiceIds)
    } catch( error ) {
      throw errorService.handleDbError('quote_invoice', error);
    }
  }

  async bulkDelete(tenantId:string, type:string, mode:string = null,currency?:string, homeCurrencyCode?:string) {
    try {
      var qry = dbService.table('quote_invoice').where({tenantId, mode});
      const quoteInvoices = await qry;
      const movedToIds = quoteInvoices.map(inv=> inv.movedToId);
      // delete record from hedge invoice and payments
      await dbService.table('hedge_invoice').whereIn("invoiceId", movedToIds).delete();
      // if(currency != '' && currency != undefined && currency != 'ALL') {
      //   qry.where({'currencyCode': currency});
      // }

      // if(homeCurrencyCode != '' && homeCurrencyCode != undefined && homeCurrencyCode != 'ALL') {
      //   qry.where({'homeCurrencyCode': homeCurrencyCode});
      // }

      // if (type) {
      //   qry.where({'type': type});
      // }
      // qry.where({'mode': mode});
      await qry.delete();
    } catch( error ) {
      throw errorService.handleDbError('quote_invoice', error);
    }
  }
}

export const quoteInvoiceDbUpdaters = new QuoteInvoiceDbUpdater();
