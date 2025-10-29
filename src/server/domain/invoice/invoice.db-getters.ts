import { map } from 'lodash';
import { GqlSupportedCurrency } from '@graphql';
import { dbService, errorService } from '@server/common';
import { InvoiceDbo, invoiceService } from '@server/invoice';
import { XeroInvoiceStatus, XeroInvoiceType } from '@server/xero';

type QueryInvoiceParam = {
  tenantId: string;
  invoiceStatus: XeroInvoiceStatus;
  invoiceType: XeroInvoiceType;
  currencyCode: GqlSupportedCurrency;
  dateTo: Date;
  mode: string | null;
};

type GetInvoiceByIdParam = {
  invoiceId: string;
  tenantId: string;
};

class InvoiceDbGetters {
  async queryInvoice({ tenantId, invoiceStatus, invoiceType, currencyCode, dateTo, mode = null }: QueryInvoiceParam) {
    try {
      const invoiceDbos: InvoiceDbo[] = await dbService
        .table('invoice')
        .select()
        .where({ tenantId, invoiceStatus, invoiceType, currencyCode, mode })
        .where('date', '<=', dateTo)
        .orderBy('date', 'desc');

      return map(invoiceDbos, invoiceService.convertDboToModel);
    } catch (error) {
      throw errorService.handleDbError('queryInvoice', error);
    }
  }

  async queryInvoiceByTenantId(tenantId: string) {
    try {
      const invoiceDbos: InvoiceDbo[] = await dbService.table('invoice').select().where({ tenantId }).orderBy('date', 'desc');

      return map(invoiceDbos, invoiceService.convertDboToModel);
    } catch (error) {
      throw errorService.handleDbError('queryInvoiceByTenantId', error);
    }
  }

  async getInvoiceById({ invoiceId, tenantId }: GetInvoiceByIdParam) {
    try {
      const [invoiceDbo]: InvoiceDbo[] = await dbService.table('invoice').select().where({ invoiceId, tenantId });

      if (!invoiceDbo) {
        return null;
      }

      return invoiceService.convertDboToModel(invoiceDbo);
    } catch (error) {
      throw errorService.handleDbError('getInvoiceByInvoiceId', error);
    }
  }
}

export const invoiceDbGetters = new InvoiceDbGetters();
