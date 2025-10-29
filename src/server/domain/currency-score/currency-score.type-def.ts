import { gql } from 'apollo-server-express';

const CURRENCY_SCORE_BASE_BREAKDOWN_FIELDS = `
  date: Date!
  month: Month!
  year: String!

  currencyScore: Int!
  costPlanScore: Int!
  gainLossScore: Int!
  marginScore: Int!
  presentScore: Int!
  targetScore: Int!

  benchmarkCurrencyScore: Int!
  benchmarkCostPlanScore: Int!
  benchmarkGainLossScore: Int!
  benchmarkMarginScore: Int!
  benchmarkPresentScore: Int!
  benchmarkTargetScore: Int!

  fxCost: Float!
  hedgedFxCost: Float!
  deliveryCost: Float!
  deliveryGainLoss: Float!
  deliveryProfitImpact: Float!
  marketProfitImpact: Float!

  performDeliveryGainLoss: Float!
  performDeliveryProfitImpact: Float!
  performMarketProfitImpact: Float!
`;

export const currencyScoreTypeDef = gql`
  type CurrencyScoreBreakdownByCurrency {
    ${CURRENCY_SCORE_BASE_BREAKDOWN_FIELDS}
    currency: SupportedCurrency!

    averageBudgetRate: Float!
    averageDeliveryRate: Float!
    averageMarketRate: Float!

    performAverageBudgetRate: Float!
    performAverageDeliveryRate: Float!
  }

  type CurrencyScoreBreakdown {
    ${CURRENCY_SCORE_BASE_BREAKDOWN_FIELDS}
    currencyScoreByCurrency: [CurrencyScoreBreakdownByCurrency!]!
  }
`;
