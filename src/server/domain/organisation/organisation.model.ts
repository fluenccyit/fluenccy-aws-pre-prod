import { GqlOrganisation } from '@graphql';
import { BaseDbo } from '@server/common';

export type OrganisationDbo = BaseDbo & {
  id: GqlOrganisation['id'];
  name: GqlOrganisation['name'];
  currency: GqlOrganisation['currency'];
  syncStatus: GqlOrganisation['syncStatus'];
  buildPlanScore: GqlOrganisation['buildPlanScore'];
  buildPlanAnswers: GqlOrganisation['buildPlanAnswers'];
  currencyScores: GqlOrganisation['currencyScores'];
  hedgeMargin: GqlOrganisation['hedgeMargin'];
  intentRegistered: GqlOrganisation['intentRegistered'];
  onboardingComplete: GqlOrganisation['onboardingComplete'];
  initialSyncComplete: GqlOrganisation['initialSyncComplete'];
  accountId: string;
  tenantId: string;
  tokenUserId?: string | null;
  variableProbability?: GqlOrganisation['variableProbability'];
};

export type OrganisationUserDbo = {
  orgId: string;
  userId: string;
};
