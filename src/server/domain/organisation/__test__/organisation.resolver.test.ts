import { head } from 'lodash';
import { gql } from 'apollo-server-express';
import { createTestClient } from 'apollo-server-testing';
import { testService } from '@test/server';
import { ERROR_MESSAGE } from '@server/common';
import { MOCK_USER } from '@server/user/__tests__/user.mocks';
import { MOCK_TENANT } from '@server/tenant/__tests__/tenant.mocks';
import { MOCK_ACCOUNT } from '@server/account/__tests__/account.mocks';
import { MOCK_PAYMENT_DBO } from '@server/payment/__tests__/payment.mocks';
import { MOCK_ORGANISATION_DBO, MOCK_ORGANISATION_MODEL } from './organisation.mocks';

describe('@server/organisation | organisationResolver', () => {
  beforeEach(() => testService.setupMockDb());
  afterEach(() => testService.tearDownMockDb());

  describe('Query', () => {
    describe('#organisationById', () => {
      const QUERY = gql`
        query OrganisationById($input: ByIdInput!) {
          organisationById(input: $input) {
            id
            name
            currency
            tradeCurrencies
            syncStatus
            tokenStatus
            onboardingComplete
            initialSyncComplete
            intentRegistered
            currencyScores {
              date
              month
              year

              currencyScore
              marginScore
              gainLossScore
              costPlanScore
              targetScore
              benchmarkCurrencyScore
              benchmarkMarginScore
              benchmarkGainLossScore
              benchmarkCostPlanScore
              benchmarkTargetScore

              fxCost
              hedgedFxCost
              deliveryCost
              deliveryGainLoss
              deliveryProfitImpact
              marketProfitImpact

              performDeliveryGainLoss
              performDeliveryProfitImpact
              performMarketProfitImpact
              currencyScoreByCurrency {
                date
                month
                year
                currency

                currencyScore
                marginScore
                gainLossScore
                costPlanScore
                targetScore
                benchmarkCurrencyScore
                benchmarkMarginScore
                benchmarkGainLossScore
                benchmarkCostPlanScore
                benchmarkTargetScore

                averageBudgetRate
                averageDeliveryRate
                averageMarketRate
                fxCost
                hedgedFxCost
                deliveryCost
                deliveryGainLoss
                deliveryProfitImpact
                marketProfitImpact

                performAverageBudgetRate
                performAverageDeliveryRate
                performDeliveryProfitImpact
                performDeliveryGainLoss
                performMarketProfitImpact
              }
            }
            buildPlanAnswers {
              questionId
              answerId
            }
            buildPlanScore
            hedgeMargin
            account {
              id
              type
              name
            }
            tenant {
              id
              lastSynced
              provider
            }
            primaryUser {
              id
              firebaseUid
              accountId
              firstName
              lastName
              role
            }
          }
        }
      `;

      it('should throw a permission error if the token user is not a `superuser`', async () => {
        testService.setDbResponse([MOCK_USER]);

        const { query } = createTestClient(testService.setupMockApolloServer());
        const { data, errors } = await query({
          query: QUERY,
          variables: { input: { id: 'mock-id' } },
        });

        expect(errors).not.toBeUndefined();
        expect(head(errors)?.message).toEqual(ERROR_MESSAGE.permission);
        expect(data).toBeFalsy();
      });

      it('should return the organisation with the passed id', async () => {
        testService.setDbResponse([
          { ...MOCK_USER, role: 'superuser' },
          MOCK_ORGANISATION_DBO,
          MOCK_ACCOUNT,
          MOCK_TENANT,
          [MOCK_PAYMENT_DBO],
          MOCK_USER,
        ]);

        const { query } = createTestClient(testService.setupMockApolloServer());
        const { data, errors } = await query({
          query: QUERY,
          variables: { input: { id: 'mock-id' } },
        });

        expect(errors).toBeUndefined();
        expect(data.organisationById).toEqual(MOCK_ORGANISATION_MODEL);
      });
    });
  });
});
