import { GqlSupportedCurrency } from '@graphql';
import { ERROR_MESSAGE, loggerService, utilService } from '@server/common';
import { invoiceDbDeleters, invoiceDbGetters, InvoiceModel } from '@server/invoice';

type QueryInvoiceParam = {
  tenantId: string;
  currency: GqlSupportedCurrency;
  dateTo: Date;
  mode: String | null;
};

type GetInvoiceByIdParam = {
  invoiceId: string;
  tenantId: string;
};

const resource = 'InvoiceResource';
class InvoiceResource {
  async queryInvoice({ tenantId, currency, dateTo, mode = null }: QueryInvoiceParam): Promise<InvoiceModel[]> {
    return await invoiceDbGetters.queryInvoice({
      tenantId,
      dateTo,
      invoiceStatus:  mode ? 'RECEIVED' : 'PAID',
      invoiceType: mode ? 'ACCREC' : 'ACCPAY',
      currencyCode: currency,
      mode: mode || null
    });
  }

  async getInvoiceById({ invoiceId, tenantId }: GetInvoiceByIdParam, allowNull?: false): Promise<InvoiceModel>;
  async getInvoiceById({ invoiceId, tenantId }: GetInvoiceByIdParam, allowNull: true): Promise<InvoiceModel | null>;
  async getInvoiceById({ invoiceId, tenantId }: GetInvoiceByIdParam, allowNull = false) {
    loggerService.info('Getting invoice by id.', { resource, method: 'getInvoiceById', invoiceId, tenantId });

    const invoice = await invoiceDbGetters.getInvoiceById({ invoiceId, tenantId });

    if (!invoice) {
      return utilService.handleAllowNull({ allowNull, error: ERROR_MESSAGE.noInvoice });
    }

    return invoice;
  }

  async deleteInvoicesByTenantId(tenantId: string) {
    const logParam = { resource, method: 'deleteInvoicesByTenantId', tenantId };

    loggerService.info('Deleting invoices by tenant id.', logParam);

    await invoiceDbDeleters.deleteInvoicesByTenantId(tenantId);
  }
}

export const invoiceResource = new InvoiceResource();
