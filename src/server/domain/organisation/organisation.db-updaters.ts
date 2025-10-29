import { isArray } from 'lodash';
import { OrganisationDbo } from '@server/organisation';
import { errorService, dbService } from '@server/common';

class OrganisationDbUpdater {
  async updateOrganisation({ id, buildPlanAnswers, currencyScores, ...organisationToUpdate }: OrganisationDbo) {
    try {
      await dbService
        .table('organisation')
        .where({ id })
        .update({
          ...organisationToUpdate,
          buildPlanAnswers: JSON.stringify(isArray(buildPlanAnswers) ? buildPlanAnswers : []),
          currencyScores: JSON.stringify(isArray(currencyScores) ? currencyScores : []),
        });
    } catch (error) {
      throw errorService.handleDbError('updateOrganisation', error);
    }
  }
}

export const organisationDbUpdaters = new OrganisationDbUpdater();
