import { InvoiceDbo } from '@server/invoice';
import { XeroProcessedInvoice } from '@server/xero';
import { dbService, errorService } from '@server/common';
import { sharedUtilService } from '@shared/common/services/shared-util.service';

class InvoiceDbCreators {
  async createInvoice(invoice: InvoiceDbo | XeroProcessedInvoice, isHedging:boolean = false) {
    try {
      if(isHedging){
        return await dbService.table('hedge_invoice').insert(invoice).onConflict(['tenantId', 'invoiceId', 'provider']).merge().returning('invoiceId');
      } else{
        await dbService.table('invoice').insert(invoice).onConflict(['tenantId', 'invoiceId', 'provider']).merge().returning('invoiceId');
      }
    } catch (error) {
      console.log('error ', error)
      throw errorService.handleDbError('createInvoice', error);
    }
  }

  async createCmsEntry(entry: InvoiceDbo | XeroProcessedInvoice) {
    try {      
      let entryWithId = {...entry, id: sharedUtilService.generateUid()}
      return await dbService.table('crm_entries').insert(entryWithId).returning('id');
    } catch (error) {
      console.log('error ', error)
      throw errorService.handleDbError('createInvoice', error);
    }
  }
}

export const invoiceDbCreators = new InvoiceDbCreators();
