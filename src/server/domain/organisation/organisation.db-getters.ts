import { map } from 'lodash';
import { dbService, errorService } from '@server/common';
import { OrganisationDbo, organisationService, OrganisationUserDbo } from '@server/organisation';

class OrganisationDbGetters {
  async queryOrganisation() {
    try {
      const organisations: OrganisationDbo[] = await dbService.table('organisation').select();

      return map(organisations, organisationService.processDbo);
    } catch (error) {
      throw errorService.handleDbError('queryOrganisation', error);
    }
  }

  async queryOrganisationByAccountId(accountId: string) {
    try {
      const qry = dbService.table('organisation').select();
      if (accountId) {
        qry.where({ accountId });
      }
      const organisations: OrganisationDbo[] = await qry;

      return map(organisations, organisationService.processDbo);
    } catch (error) {
      throw errorService.handleDbError('queryOrganisationByAccountId', error);
    }
  }

  async queryOrganisationByTenantId(tenantId: string) {
    try {
      const organisations: OrganisationDbo[] = await dbService.table('organisation').select().where({ tenantId });

      return map(organisations, organisationService.processDbo);
    } catch (error) {
      throw errorService.handleDbError('queryOrganisationByTenantId', error);
    }
  }

  async getOrganisationById(id: string) {
    try {
      const [organisation]: OrganisationDbo[] = await dbService.table('organisation').select().where({ id });

      if (!organisation) {
        return null;
      }

      return organisationService.processDbo(organisation);
    } catch (error) {
      throw errorService.handleDbError('getOrganisationById', error);
    }
  }

  async queryOrganisationUserByOrgId(orgId: string) {
    try {
      const organisationUsers: OrganisationUserDbo[] = await dbService.table('organisation_user').select().where({ orgId });

      return organisationUsers || [];
    } catch (error) {
      throw errorService.handleDbError('queryOrganisationUserByOrgId', error);
    }
  }

  async getOrganisationUser({ orgId, userId }: OrganisationUserDbo) {
    try {
      const [organisationUser]: OrganisationUserDbo[] = await dbService.table('organisation_user').select().where({ orgId, userId });

      if (!organisationUser) {
        return null;
      }

      return organisationUser;
    } catch (error) {
      throw errorService.handleDbError('getOrganisationUser', error);
    }
  }
}

export const organisationDbGetters = new OrganisationDbGetters();
