import { TenantDbo } from '@server/tenant';
import { errorService, dbService } from '@server/common';

class TenantDbUpdater {
  async updateTenant({ id, ...tenantToUpdate }: TenantDbo) {
    try {
      await dbService.table('tenant').where({ id }).update(tenantToUpdate);
    } catch (error) {
      throw errorService.handleDbError('updateTenant', error);
    }
  }
}

export const tenantDbUpdaters = new TenantDbUpdater();
