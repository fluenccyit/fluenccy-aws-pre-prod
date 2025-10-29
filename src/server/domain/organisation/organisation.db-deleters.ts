import { dbService, errorService } from '@server/common';
import { OrganisationUserDbo } from '@server/organisation';

class OrganisationDbDeleters {
  async deleteOrganisationById(id: string) {
    try {
      await dbService.table('organisation').where({ id }).delete();
    } catch (error) {
      throw errorService.handleDbError('deleteOrganisationById', error);
    }
  }

  async deleteOrganisationUser(organisationUser: OrganisationUserDbo) {
    try {
      await dbService.table('organisation_user').where(organisationUser).delete();
    } catch (error) {
      throw errorService.handleDbError('deleteOrganisationUser', error);
    }
  }

  async deleteOrganisationUserByOrgId(orgId: string) {
    try {
      await dbService.table('organisation_user').where({ orgId }).delete();
    } catch (error) {
      throw errorService.handleDbError('deleteOrganisationUserByOrgId', error);
    }
  }
}

export const organisationDbDeleters = new OrganisationDbDeleters();
