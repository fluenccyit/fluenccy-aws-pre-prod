import { errorService, dbService } from '@server/common';
import { InvoiceDbo } from '@server/invoice';

class InvoiceDbUpdater {
  async updateInvoice({ invoiceId, ...invoiceToUpdate }: InvoiceDbo) {
    try {
      await dbService.table('invoice').where({ invoiceId }).update(invoiceToUpdate);
    } catch (error) {
      throw errorService.handleDbError('updateInvoice', error);
    }
  }
}

export const invoiceDbUpdaters = new InvoiceDbUpdater();
