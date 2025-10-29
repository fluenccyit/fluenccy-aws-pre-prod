import { dbService, errorService } from '@server/common';

class InvoiceDbDeleters {
  async deleteInvoiceByInvoiceId(invoiceId: string) {
    try {
      await dbService.table('invoice').where({ invoiceId }).delete();
    } catch (error) {
      throw errorService.handleDbError('deleteInvoiceByInvoiceId', error);
    }
  }

  deleteInvoicesByTenantId = async (tenantId: string) => {
    try {
      await dbService.table('invoice').where({ tenantId }).delete();
    } catch (error) {
      throw errorService.handleDbError('deleteInvoicesByTenantId', error);
    }
  };
}

export const invoiceDbDeleters = new InvoiceDbDeleters();
