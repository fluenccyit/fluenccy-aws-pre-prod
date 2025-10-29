import { TenantDbo } from '@server/tenant';
import { dbService, errorService } from '@server/common';

class TenantDbGetters {
  async queryTenant() {
    try {
      const tenants: TenantDbo[] = await dbService.table('tenant').select();

      return tenants;
    } catch (error) {
      throw errorService.handleDbError('queryTenant', error);
    }
  }

  async getTenantById(id: string) {
    try {
      const [tenant]: TenantDbo[] = await dbService.table('tenant').select().where({ id });

      if (!tenant) {
        return null;
      }

      return tenant;
    } catch (error) {
      throw errorService.handleDbError('getTenantById', error);
    }
  }
}

export const tenantDbGetters = new TenantDbGetters();
