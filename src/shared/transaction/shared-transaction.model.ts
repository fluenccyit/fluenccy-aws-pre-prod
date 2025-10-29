import { GroupedByMonthYearType } from '@shared/common';

type TransactionDetailsType = DateRangeParam & {
  averageBudgetRate: number;
  averageDeliveryRate: number;
  averageDeliveryCost: number;
  averageMarketRate: number;
  averagePastMargin: number;
  averageReturnRate: number;
  averageAdjustedReturnRate: number;
  fxCost: number;
  hedgedFxCost: number;
  maxCost: number;
  maxRate: number;
  medianPastMargin: number;
  minCost: number;
  minRate: number;
  potentialGain: number;
  potentialLoss: number;
  bought: number;
  budgetCost: number;
  deliveryCost: number;
  deliveryGainLoss: number;
  deliveryGainLossMargin: number;

  performAverageBudgetRate: number;
  performAverageDeliveryRate: number;
  performAverageReturnRate: number;
  performAverageAdjustedReturnRate: number;
  performBudgetCost: number;
  performBudgetGainLoss: number;
  performBudgetGainLossMargin: number;
  performAdjustedBudgetCost: number;
  performAdjustedBudgetGainLoss: number;
  performAdjustedBudgetGainLossMargin: number;
  performDeliveryCost: number;
  performDeliveryGainLoss: number;
  performDeliveryGainLossMargin: number;
};

export type TransactionDetailsByMonthType = GroupedByMonthYearType & TransactionDetailsType;

export type TransactionBreakdownType = TransactionDetailsType & {
  deliveryProfitImpact: number;
  deliveryRateRisk: number;
  marketProfitImpact: number;
  marketRateRisk: number;
  performDeliveryProfitImpact: number;
  performDeliveryRateRisk: number;
  performMarketProfitImpact: number;
  performSharpe: number;
  performSharpeRatio: number;
  sharpe: number;
  transactionsByMonth: TransactionDetailsByMonthType[];
};
