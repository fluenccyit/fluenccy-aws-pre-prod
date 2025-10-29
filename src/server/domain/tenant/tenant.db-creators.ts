import { TenantDbo } from '@server/tenant';
import { dbService, errorService } from '@server/common';
import { sharedUtilService } from '@shared/common/services/shared-util.service';

class TenantDbCreators {
  async createTenant(tenant: TenantDbo) {
    try {
      await dbService.table('tenant').insert({
        ...tenant,
        id: tenant.id || sharedUtilService.generateUid()
      });
    } catch (error) {
      throw errorService.handleDbError('createTenant', error);
    }
  }
}

export const tenantDbCreators = new TenantDbCreators();
