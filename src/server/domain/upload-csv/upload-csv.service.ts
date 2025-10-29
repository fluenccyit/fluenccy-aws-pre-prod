import { map } from 'lodash';
import { OrganisationDbo } from '@server/organisation';

class UploadCSVService {
  // Because we will get an apollo error if we try to request a non-nullable field, we're adding this process method as a safety net. Since we are
  // storing the currency scores as raw JSON against the organisation, there is a risk of the user getting an error due to the currency score
  // structure changing, and it not being updated for a particular organisation. So we will default all expected values to 0.
  processDbos = (currencyScoreDbos: OrganisationDbo['currencyScores']): OrganisationDbo['currencyScores'] => {
    return map(currencyScoreDbos, (breakdown) => ({
      date: breakdown.date,
      month: breakdown.month,
      year: breakdown.year,

      currencyScore: breakdown.currencyScore || 0,
      costPlanScore: breakdown.costPlanScore || 0,
      gainLossScore: breakdown.gainLossScore || 0,
      marginScore: breakdown.marginScore || 0,
      presentScore: breakdown.presentScore || 0,
      targetScore: breakdown.targetScore || 0,

      benchmarkCurrencyScore: breakdown.benchmarkCurrencyScore || 0,
      benchmarkCostPlanScore: breakdown.benchmarkCostPlanScore || 0,
      benchmarkGainLossScore: breakdown.benchmarkGainLossScore || 0,
      benchmarkMarginScore: breakdown.benchmarkMarginScore || 0,
      benchmarkPresentScore: breakdown.benchmarkPresentScore || 0,
      benchmarkTargetScore: breakdown.benchmarkTargetScore || 0,

      fxCost: breakdown.fxCost || 0,
      hedgedFxCost: breakdown.hedgedFxCost || 0,
      deliveryCost: breakdown.deliveryCost || 0,
      deliveryGainLoss: breakdown.deliveryGainLoss || 0,
      deliveryProfitImpact: breakdown.deliveryProfitImpact || 0,
      marketProfitImpact: breakdown.marketProfitImpact || 0,

      performDeliveryGainLoss: breakdown.performDeliveryGainLoss || 0,
      performDeliveryProfitImpact: breakdown.performDeliveryProfitImpact || 0,
      performMarketProfitImpact: breakdown.performMarketProfitImpact || 0,

      currencyScoreByCurrency: map(breakdown.currencyScoreByCurrency, (breakdown) => ({
        date: breakdown.date,
        month: breakdown.month,
        year: breakdown.year,
        currency: breakdown.currency,

        currencyScore: breakdown.currencyScore || 0,
        costPlanScore: breakdown.costPlanScore || 0,
        gainLossScore: breakdown.gainLossScore || 0,
        marginScore: breakdown.marginScore || 0,
        presentScore: breakdown.presentScore || 0,
        targetScore: breakdown.targetScore || 0,

        benchmarkCurrencyScore: breakdown.benchmarkCurrencyScore || 0,
        benchmarkCostPlanScore: breakdown.benchmarkCostPlanScore || 0,
        benchmarkGainLossScore: breakdown.benchmarkGainLossScore || 0,
        benchmarkMarginScore: breakdown.benchmarkMarginScore || 0,
        benchmarkPresentScore: breakdown.benchmarkPresentScore || 0,
        benchmarkTargetScore: breakdown.benchmarkTargetScore || 0,

        averageBudgetRate: breakdown.averageBudgetRate || 0,
        averageDeliveryRate: breakdown.averageDeliveryRate || 0,
        averageMarketRate: breakdown.averageMarketRate || 0,

        fxCost: breakdown.fxCost || 0,
        hedgedFxCost: breakdown.hedgedFxCost || 0,
        deliveryCost: breakdown.deliveryCost || 0,
        deliveryGainLoss: breakdown.deliveryGainLoss || 0,
        deliveryProfitImpact: breakdown.deliveryProfitImpact || 0,
        marketProfitImpact: breakdown.marketProfitImpact || 0,

        performAverageBudgetRate: breakdown.performAverageBudgetRate || 0,
        performAverageDeliveryRate: breakdown.performAverageDeliveryRate || 0,
        performDeliveryGainLoss: breakdown.performDeliveryGainLoss || 0,
        performDeliveryProfitImpact: breakdown.performDeliveryProfitImpact || 0,
        performMarketProfitImpact: breakdown.performMarketProfitImpact || 0,
      })),
    }));
  };
}

export const uploadCSVService = new UploadCSVService();
