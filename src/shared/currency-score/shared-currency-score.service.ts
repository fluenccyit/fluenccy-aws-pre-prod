import numeral from 'numeral';
import { format } from 'date-fns';
import { clamp, find, inRange, last, round } from 'lodash';
import { SHARED_DATE_TIME_FORMAT } from '@shared/common';
import { sharedTransactionService } from '@shared/transaction';
import { CURRENCY_SCORE_ALLOCATION } from '@shared/currency-score';
import { ForwardPointMapByDate, RateMapByDate, sharedRateService } from '@shared/rate';
import {
  GqlSupportedCurrency,
  GqlInvoice,
  GqlMonth,
  GqlOrganisationBuildPlanAnswer,
  GqlCurrencyScoreBreakdownByCurrency,
  GqlPayment,
} from '@graphql';

type GetCurrencyScoreParam = DateRangeParam & {
  currency: GqlSupportedCurrency;
  buildPlanAnswers: GqlOrganisationBuildPlanAnswer[];
  hedgeMargin: number;
  invoices: GqlInvoice[];
  payments: GqlPayment[];
  rateMap: RateMapByDate;
  forwardPointMap: ForwardPointMapByDate;
};

class SharedCurrencyScoreService {
  getCurrencyScoreByCurrency(param: GetCurrencyScoreParam): GqlCurrencyScoreBreakdownByCurrency {
    const { currency, dateTo } = param;
    const breakdown = sharedTransactionService.calculateBreakdown(param);

    const costPlanScore = this.getCostPlanScore(breakdown.performSharpeRatio);
    const gainLossScore = this.getGainLossScore(breakdown.deliveryGainLossMargin);
    const marginScore = this.getMarginScore(breakdown.averagePastMargin);
    const presentScore = this.getPresentScore(breakdown.marketRateRisk);
    const targetScore = this.getTargetScore(param);
    const currencyScore = numeral(marginScore).add(gainLossScore).add(costPlanScore).add(targetScore).add(presentScore).value();

    const benchmarkCostPlanScore = CURRENCY_SCORE_ALLOCATION.costPlan;
    const benchmarkGainLossScore = this.getGainLossScore(breakdown.performDeliveryGainLossMargin);
    const benchmarkMarginScore = this.getMarginScore(param.hedgeMargin);
    const benchmarkPresentScore = this.getPresentScore(breakdown.performDeliveryRateRisk);
    const benchmarkTargetScore = this.getTargetScore(param);
    const benchmarkCurrencyScore = numeral(benchmarkMarginScore)
      .add(benchmarkGainLossScore)
      .add(benchmarkCostPlanScore)
      .add(benchmarkTargetScore)
      .add(benchmarkPresentScore)
      .value();

    return {
      date: dateTo,
      month: format(dateTo, SHARED_DATE_TIME_FORMAT.month) as GqlMonth,
      year: format(dateTo, SHARED_DATE_TIME_FORMAT.year),
      currency,

      currencyScore,
      costPlanScore,
      gainLossScore,
      marginScore,
      presentScore,
      targetScore,

      benchmarkCurrencyScore,
      benchmarkCostPlanScore,
      benchmarkGainLossScore,
      benchmarkMarginScore,
      benchmarkPresentScore,
      benchmarkTargetScore,

      averageBudgetRate: breakdown.averageBudgetRate,
      averageDeliveryRate: breakdown.averageDeliveryRate,
      averageMarketRate: breakdown.averageMarketRate,

      deliveryCost: breakdown.deliveryCost,
      fxCost: breakdown.fxCost,
      hedgedFxCost: breakdown.hedgedFxCost,
      deliveryProfitImpact: breakdown.deliveryProfitImpact,
      deliveryGainLoss: breakdown.deliveryGainLoss,
      marketProfitImpact: breakdown.marketProfitImpact,

      performAverageBudgetRate: breakdown.performAverageBudgetRate,
      performAverageDeliveryRate: breakdown.performAverageDeliveryRate,
      performDeliveryGainLoss: breakdown.performDeliveryGainLoss,
      performDeliveryProfitImpact: breakdown.performDeliveryProfitImpact,
      performMarketProfitImpact: breakdown.performMarketProfitImpact,
    };
  }

  getCostPlanScore = (sharpeRatio: number) => {
    const costPlanScore = numeral(sharpeRatio).multiply(CURRENCY_SCORE_ALLOCATION.costPlan).value();

    return round(clamp(costPlanScore, 0, CURRENCY_SCORE_ALLOCATION.costPlan));
  };

  getPresentScore = (marketRateRisk: number) => {
    if (marketRateRisk < 0.03) {
      return CURRENCY_SCORE_ALLOCATION.present;
    } else {
      const pointsLost = numeral(marketRateRisk).subtract(0.03).multiply(1000).value();
      const presentScore = numeral(CURRENCY_SCORE_ALLOCATION.present).subtract(pointsLost).value();

      return round(clamp(presentScore, 0, CURRENCY_SCORE_ALLOCATION.present));
    }
  };

  getMarginScore = (averagePastMargin: number) => {
    let marginScore = 0;

    if (averagePastMargin <= 0.001) {
      marginScore = CURRENCY_SCORE_ALLOCATION.margin;
    } else if (averagePastMargin >= 0.01) {
      marginScore = 0;
    } else {
      const marginPercentage = numeral(averagePastMargin).multiply(100).value();
      const marginPercentageInverse = numeral(1).subtract(marginPercentage).value();

      marginScore = numeral(CURRENCY_SCORE_ALLOCATION.margin).multiply(marginPercentageInverse).value();
    }

    return round(clamp(marginScore, 0, CURRENCY_SCORE_ALLOCATION.margin));
  };

  getGainLossScore = (gainLossMargin: number) => {
    let gainLossScore = 0;

    if (inRange(gainLossMargin, -0.05, -0.02)) {
      gainLossScore = 15;
    } else if (inRange(gainLossMargin, -0.02, 0)) {
      gainLossScore = 20;
    } else if (inRange(gainLossMargin, 0, 0.02)) {
      gainLossScore = CURRENCY_SCORE_ALLOCATION.gainLoss;
    } else if (inRange(gainLossMargin, 0.02, 0.05)) {
      gainLossScore = 20;
    } else if (gainLossMargin > 0.05) {
      gainLossScore = 15;
    }

    return gainLossScore;
  };

  getTargetScore = ({ invoices, rateMap, buildPlanAnswers }: GetCurrencyScoreParam) => {
    const invoice = last(invoices);
    const rate = sharedRateService.getRateOnDate({ rateMap, date: new Date() });
    const profitMarginAnswer = find(buildPlanAnswers, ({ questionId }) => questionId === 'profitMargin');

    if (!invoice || !rate || !profitMarginAnswer) {
      return 0;
    }

    let targetScore = 0;
    const { answerId } = profitMarginAnswer;
    const rateDifference = numeral(invoice.currencyRate).subtract(rate.open).value();

    if (answerId === 'lessThanTenPercent') {
      if (inRange(rateDifference, -0.03, -0.02)) {
        targetScore = 20;
      } else if (inRange(rateDifference, -0.02, -0.01)) {
        targetScore = 50;
      } else if (inRange(rateDifference, -0.01, 0)) {
        targetScore = 40;
      }
    } else if (answerId === 'tenToThirtyPercent') {
      if (rateDifference < -0.03) {
        targetScore = 20;
      } else if (inRange(rateDifference, -0.03, -0.02)) {
        targetScore = 50;
      } else if (inRange(rateDifference, -0.02, -0.01)) {
        targetScore = 20;
      } else if (inRange(rateDifference, -0.01, 0)) {
        targetScore = 20;
      }
    } else if (answerId === 'moreThanThirtyPercent') {
      if (rateDifference < -0.03) {
        targetScore = 50;
      } else if (inRange(rateDifference, -0.03, -0.02)) {
        targetScore = 30;
      } else if (inRange(rateDifference, -0.02, -0.01)) {
        targetScore = 15;
      } else if (inRange(rateDifference, -0.01, 0)) {
        targetScore = 15;
      } else {
        targetScore = 15;
      }
    }

    return targetScore;
  };
}

export const sharedCurrencyScoreService = new SharedCurrencyScoreService();
