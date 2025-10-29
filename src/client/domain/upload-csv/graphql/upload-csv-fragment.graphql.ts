import { gql } from '@apollo/client';

export const CURRENCY_SCORE_CORE_FIELDS_FRAGMENT = gql`
  fragment CoreCurrencyScoreFields on CurrencyScoreBreakdown {
    date
    month
    year

    currencyScore
    costPlanScore
    gainLossScore
    marginScore
    presentScore
    targetScore

    benchmarkCurrencyScore
    benchmarkCostPlanScore
    benchmarkGainLossScore
    benchmarkMarginScore
    benchmarkPresentScore
    benchmarkTargetScore

    fxCost
    hedgedFxCost
    marketProfitImpact
    deliveryCost
    deliveryGainLoss
    deliveryProfitImpact
    performDeliveryGainLoss
    performDeliveryProfitImpact
    performMarketProfitImpact

    currencyScoreByCurrency {
      date
      month
      year
      currency

      currencyScore
      costPlanScore
      gainLossScore
      marginScore
      presentScore
      targetScore

      benchmarkCurrencyScore
      benchmarkCostPlanScore
      benchmarkGainLossScore
      benchmarkMarginScore
      benchmarkPresentScore
      benchmarkTargetScore

      fxCost
      hedgedFxCost
      marketProfitImpact
      deliveryCost
      deliveryGainLoss
      deliveryProfitImpact
      averageBudgetRate
      averageDeliveryRate
      averageMarketRate

      performAverageBudgetRate
      performAverageDeliveryRate
      performDeliveryGainLoss
      performDeliveryProfitImpact
      performMarketProfitImpact
    }
  }
`;
