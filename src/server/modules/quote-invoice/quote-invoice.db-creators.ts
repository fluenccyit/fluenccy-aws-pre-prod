import { dbService, errorService } from '@server/common';
import { sharedUtilService } from '@shared/common/services/shared-util.service';
import { InvoiceDbo } from '@server/invoice';

class QuoteInvoiceDbCreators {
  async createInvoice(invoice: InvoiceDbo, isHedging:boolean = false) {
    try {
      let invoiceWithId = {...invoice, id: sharedUtilService.generateUid()};
      await dbService.table('quote_invoice').insert(invoiceWithId).onConflict(['tenantId', 'invoiceId', 'provider']).merge();
    } catch (error) {
      console.log('error: ', error)
      throw errorService.handleDbError('createInvoice', error);
    }
  }

  async createCmsEntry(entry: InvoiceDbo) {
    try {
      return await dbService.table('crm_entries').insert({
        ...entry,
        id: entry.id || sharedUtilService.generateUid()
      });
    } catch (error) {
      console.log('error: ', error)
      throw errorService.handleDbError('createInvoice', error);
    }
  }
}

export const quoteInvoiceDbCreators = new QuoteInvoiceDbCreators();
