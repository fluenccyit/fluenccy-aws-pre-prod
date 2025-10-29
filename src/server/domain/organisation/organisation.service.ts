import { OrganisationDbo } from '@server/organisation';
import { currencyScoreService } from '@server/currency-score';

class OrganisationService {
  processDbo = (organisationDbo: OrganisationDbo): OrganisationDbo => ({
    ...organisationDbo,
    currencyScores: currencyScoreService.processDbos(organisationDbo.currencyScores),
  });
}

export const organisationService = new OrganisationService();
