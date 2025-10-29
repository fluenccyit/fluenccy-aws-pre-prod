import { LocalOrganisationType } from '@client/organisation';

export const MOCK_ORGANISATION: LocalOrganisationType = {
  id: 'mock-org-id',
  name: 'mock-org-name',
  currency: 'NZD',
  tradeCurrencies: ['AUD', 'USD', 'EUR'],
  syncStatus: 'synced',
  tokenStatus: 'active',
  hedgeMargin: 0.0035,
  currencyScores: [],
  buildPlanAnswers: [],
  buildPlanScore: 20,
  onboardingComplete: true,
  intentRegistered: true,
  initialSyncComplete: true,
  tenant: {
    id: 'mock-tenant-id',
    lastSynced: new Date(),
  },
};
