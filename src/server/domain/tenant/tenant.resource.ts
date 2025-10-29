import { GqlTenant } from '@graphql';
import { invoiceResource } from '@server/invoice';
import { paymentDbGetters, paymentResource } from '@server/payment';
import { ERROR_MESSAGE, loggerService, utilService } from '@server/common';
import { tenantDbDeleters, tenantDbGetters, TenantDbo, tenantDbUpdaters } from '@server/tenant';

type UpdateTenantParam = {
  tenantId: TenantDbo['id'];
  lastSynced: TenantDbo['lastSynced'];
};

const resource = 'TenantResource';
class TenantResource {
  queryTenant = async () => {
    return await tenantDbGetters.queryTenant();
  };

  async getTenantById(id: string, allowNull?: false): Promise<GqlTenant>;
  async getTenantById(id: string, allowNull: true): Promise<GqlTenant | null>;
  async getTenantById(id: string, allowNull = false) {
    loggerService.info('Getting tenant by id.', { resource, method: 'getTenantById', id });

    const tenantDbo = await tenantDbGetters.getTenantById(id);

    if (!tenantDbo) {
      return utilService.handleAllowNull({ allowNull, error: ERROR_MESSAGE.noTenant });
    }

    return tenantDbo;
  }

  async queryCurrencyByTenantId(tenantId: string, paymentType?: string) {
    return await paymentDbGetters.queryDistinctCurrenciesByTenantId(tenantId, paymentType);
  }

  async updateTenant({ tenantId, ...args }: UpdateTenantParam) {
    const logParam = { resource, method: 'updateTenant', tenantId, args: JSON.stringify(args) };

    loggerService.info('Updating tenant.', logParam);

    const tenantDbo = await this.getTenantById(tenantId);

    utilService.patchObject(tenantDbo, 'lastSynced', args.lastSynced);

    await tenantDbUpdaters.updateTenant(tenantDbo);

    return await this.getTenantById(tenantId);
  }

  async deleteTenantById(tenantId: string) {
    const logParam = { resource, method: 'deleteTenantById', tenantId };

    loggerService.info('Deleting tenant.', logParam);

    loggerService.info('Deleting payments associated with tenant.', logParam);
    await paymentResource.deletePaymentsByTenantId(tenantId);

    loggerService.info('Deleting invoices associated with tenant.', logParam);
    await invoiceResource.deleteInvoicesByTenantId(tenantId);

    loggerService.info('Deleting tenant from database.', logParam);
    await tenantDbDeleters.deleteTenantById(tenantId);
  }
}

export const tenantResource = new TenantResource();
