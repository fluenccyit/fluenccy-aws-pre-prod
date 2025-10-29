import { GqlOrganisation } from '@graphql';
import { OrganisationUserDbo, OrganisationDbo } from '@server/organisation';
import { MOCK_USER } from '@server/user/__tests__/user.mocks';
import { MOCK_TENANT } from '@server/tenant/__tests__/tenant.mocks';
import { MOCK_ACCOUNT } from '@server/account/__tests__/account.mocks';

export const MOCK_ORGANISATION_DBO: OrganisationDbo = {
  id: 'mock-id',
  name: 'mock-name',
  currency: 'NZD',
  syncStatus: 'synced',
  buildPlanScore: 20,
  buildPlanAnswers: [],
  currencyScores: [],
  hedgeMargin: 0.0035,
  onboardingComplete: true,
  intentRegistered: true,
  initialSyncComplete: true,
  accountId: MOCK_ACCOUNT.id,
  tenantId: MOCK_TENANT.id,
  tokenUserId: MOCK_USER.id,
};

export const MOCK_ORGANISATION_MODEL: GqlOrganisation = {
  id: MOCK_ORGANISATION_DBO.id,
  name: MOCK_ORGANISATION_DBO.name,
  currency: MOCK_ORGANISATION_DBO.currency,
  tradeCurrencies: [],
  syncStatus: MOCK_ORGANISATION_DBO.syncStatus,
  buildPlanScore: MOCK_ORGANISATION_DBO.buildPlanScore,
  buildPlanAnswers: MOCK_ORGANISATION_DBO.buildPlanAnswers,
  currencyScores: MOCK_ORGANISATION_DBO.currencyScores,
  hedgeMargin: MOCK_ORGANISATION_DBO.hedgeMargin,
  onboardingComplete: MOCK_ORGANISATION_DBO.onboardingComplete,
  intentRegistered: MOCK_ORGANISATION_DBO.intentRegistered,
  initialSyncComplete: MOCK_ORGANISATION_DBO.initialSyncComplete,
  account: MOCK_ACCOUNT,
  primaryUser: MOCK_USER,
  tenant: MOCK_TENANT,
  tokenStatus: 'disconnected',
};

export const MOCK_ORGANISATION_USER: OrganisationUserDbo = {
  orgId: 'mock-orgId',
  userId: 'mock-userId',
};
