import { dbService, errorService } from '@server/common';
import { sharedUtilService } from '@shared/common/services/shared-util.service';
import { OrganisationDbo, OrganisationUserDbo } from '@server/organisation';
import { isArray } from 'lodash';

class OrganisationDbCreators {
  async createOrganisation({ buildPlanAnswers, currencyScores, ...organisationToCreate }: OrganisationDbo) {
    try {
      await dbService.table('organisation').insert({
        ...organisationToCreate,
        id: organisationToCreate.id || sharedUtilService.generateUid(),
        buildPlanAnswers: JSON.stringify(isArray(buildPlanAnswers) ? buildPlanAnswers : []),
        currencyScores: JSON.stringify(isArray(currencyScores) ? currencyScores : []),
      });
    } catch (error) {
      throw errorService.handleDbError('createOrganisation', error);
    }
  }

  async createOrganisationUser(organisationUser: OrganisationUserDbo) {
    try {
      await dbService.table('organisation_user').insert(organisationUser);
    } catch (error) {
      throw errorService.handleDbError('createOrganisationUser', error);
    }
  }
}

export const organisationDbCreators = new OrganisationDbCreators();
