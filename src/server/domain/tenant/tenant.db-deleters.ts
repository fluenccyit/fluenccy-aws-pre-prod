import { dbService, errorService } from '@server/common';

class TenantDbDeleters {
  async deleteTenantById(id: string) {
    try {
      await dbService.table('tenant').where({ id }).delete();
    } catch (error) {
      throw errorService.handleDbError('deleteTenantById', error);
    }
  }
}

export const tenantDbDeleters = new TenantDbDeleters();
