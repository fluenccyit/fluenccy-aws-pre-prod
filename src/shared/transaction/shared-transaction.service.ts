import numeral from 'numeral';
import { isAfter, isSameDay, startOfMonth, sub, format } from 'date-fns';
import { forEach, find, map, max, min, mean, filter, last, sum } from 'lodash';
import { GqlInvoice, GqlPayment } from '@graphql';
import { sharedPlanService } from '@shared/plan';
import { sharedPaymentService } from '@shared/payment';
import { sharedDateTimeService, sharedNumberService } from '@shared/common';
import { ForwardPointMapByDate, RateMapByDate, sharedRateService } from '@shared/rate';
import { TransactionBreakdownType, TransactionDetailsByMonthType } from '@shared/transaction';

type CalculateTransactionBreakdownParam = DateRangeParam & {
  invoices: GqlInvoice[];
  payments: GqlPayment[];
  rateMap: RateMapByDate;
  forwardPointMap: ForwardPointMapByDate;
  hedgeMargin: number;
};

class SharedTransactionService {
  calculateBreakdown = (param: CalculateTransactionBreakdownParam): TransactionBreakdownType => {
    const { payments, invoices, rateMap, forwardPointMap, dateFrom, dateTo, hedgeMargin, endWithNonEmpty, numberOfMonths } = param;
    let transactionsByMonth = this.getTransactionDetailGroupedByMonthCollection(param);
    const paymentsByMonthYear = sharedPaymentService.groupPaymentsByMonthYear(payments);
    const performUnhedgedPercentage = sharedPlanService.getPerformUnhedgedPercentage();
    const lastDayOfMonthDeliveryRates: number[] = [];
    const lastDayOfMonthMarketRates: number[] = [];
    const lastDayOfMonthPerformDeliveryRates: number[] = [];
    const periodArrays = { ...this.getTransactionArrays(), potentialGains: [] as number[], potentialLosses: [] as number[] };
    // We need to lock the budget rate for 6 months at a time, using the rate of the 1st January, and 1st July. So we need to detect the month we're,
    // in, and then lock the new budget rate in, depending on which half of the year we're in.
    let performBudgetRate = 0;
    let performAdjustedBudgetRate = 0;
    if (endWithNonEmpty) {
      let found = false;

      let tempTransactionsByMonth = [...transactionsByMonth].reverse();
      const firstNonEmptyIndex = tempTransactionsByMonth.findIndex(transaction => {
        const { monthYear, month } = transaction;
        forEach(paymentsByMonthYear[monthYear], (payment) => {
          const invoice = find(invoices, (invoice) => invoice.invoiceId === payment.invoiceId);
          if (!invoice) {
            return;
          } else {
            found = true;
          }
        });
        if (!found) {
          return false;
        }
        return true;
      });

      transactionsByMonth = tempTransactionsByMonth.slice(firstNonEmptyIndex, numberOfMonths + firstNonEmptyIndex).reverse();
    }

    forEach(transactionsByMonth, (transaction) => {
      const { monthYear, month } = transaction;
      const monthlyArrays = this.getTransactionArrays();

      if (!performBudgetRate || month === 'Jan' || month === 'Jul') {
        const isInitial = !performBudgetRate && month !== 'Jan' && month !== 'Jul';
        const monthYearToUse = isInitial ? sharedPlanService.getInitialPerformBudgetRateDateFromMonthYear({ monthYear }) : monthYear;

        performBudgetRate = sharedPlanService.getPerformBudgetRate({ monthYear: monthYearToUse, rateMap });
        performAdjustedBudgetRate = sharedPlanService.getPerformBudgetRate({ monthYear: monthYearToUse, rateMap, isAdjusted: true });
      }

      forEach(paymentsByMonthYear[monthYear], (payment) => {
        const invoice = find(invoices, (invoice) => invoice.invoiceId === payment.invoiceId);
        if (!invoice) {
          return;
        }

        // ======================= CLIENT =======================
        // Invoice details.
        periodArrays.raisedAmounts.push(invoice.total);
        periodArrays.budgetRates.push(invoice.currencyRate);
        monthlyArrays.raisedAmounts.push(invoice.total);
        monthlyArrays.budgetRates.push(invoice.currencyRate);

        // Payment details.
        periodArrays.minRates.push(payment.minRate);
        periodArrays.minCosts.push(payment.minCost);
        periodArrays.maxRates.push(payment.maxRate);
        periodArrays.maxCosts.push(payment.maxCost);
        periodArrays.deliveryRates.push(payment.currencyRate);
        periodArrays.deliveryCosts.push(payment.actualCost);
        monthlyArrays.minRates.push(payment.minRate);
        monthlyArrays.minCosts.push(payment.minCost);
        monthlyArrays.maxRates.push(payment.maxRate);
        monthlyArrays.maxCosts.push(payment.maxCost);
        monthlyArrays.deliveryRates.push(payment.currencyRate);
        monthlyArrays.deliveryCosts.push(payment.actualCost);

        // Market rate details.
        const rate = sharedRateService.getRateOnDate({ rateMap, date: payment.date });
        periodArrays.marketRates.push(rate.open);
        monthlyArrays.marketRates.push(rate.open);

        // Budget cost details.
        const budgetCost = sharedPaymentService.getBudgetCost({ invoice, payment });
        periodArrays.budgetCosts.push(budgetCost);
        monthlyArrays.budgetCosts.push(budgetCost);

        // Delivery gain loss details.
        const deliveryGainLoss = payment.paymentType === 'ACCRECPAYMENT' ? numeral(payment.actualCost).subtract(budgetCost).value() : numeral(budgetCost).subtract(payment.actualCost).value();
        periodArrays.deliveryGainLosses.push(deliveryGainLoss);
        monthlyArrays.deliveryGainLosses.push(deliveryGainLoss);

        // Past margin details.
        const pastMargin = sharedPaymentService.getPastMargin({ payment, rate });
        periodArrays.pastMargins.push(pastMargin);
        monthlyArrays.pastMargins.push(pastMargin);

        // Return rate details.
        const returnRate = sharedPaymentService.getReturnRate({ deliveryRate: payment.currencyRate, budgetRate: performBudgetRate });
        const adjustedReturnRate = sharedPaymentService.getReturnRate({ deliveryRate: payment.currencyRate, budgetRate: performAdjustedBudgetRate });
        periodArrays.returnRates.push(returnRate);
        periodArrays.adjustedReturnRates.push(adjustedReturnRate);
        monthlyArrays.returnRates.push(returnRate);
        monthlyArrays.adjustedReturnRates.push(adjustedReturnRate);

        // ===================== PERFORMANCE =====================
        // Perform budget details.
        periodArrays.performBudgetRates.push(performBudgetRate);
        periodArrays.performAdjustedBudgetRates.push(performAdjustedBudgetRate);
        monthlyArrays.performBudgetRates.push(performBudgetRate);
        monthlyArrays.performAdjustedBudgetRates.push(performAdjustedBudgetRate);

        // Perform budget cost details.
        const performBudgetCost = numeral(payment.amount).divide(performBudgetRate).value();
        const performAdjustedBudgetCost = numeral(payment.amount).divide(performAdjustedBudgetRate).value();
        periodArrays.performBudgetCosts.push(performBudgetCost);
        periodArrays.performAdjustedBudgetCosts.push(performAdjustedBudgetCost);
        monthlyArrays.performBudgetCosts.push(performBudgetCost);
        monthlyArrays.performAdjustedBudgetCosts.push(performAdjustedBudgetCost);

        // Perform budget gain loss details.
        const performBudgetGainLoss = numeral(performBudgetCost).subtract(payment.actualCost).value();
        const performAdjustedBudgetGainLoss = numeral(performAdjustedBudgetCost).subtract(payment.actualCost).value();
        periodArrays.performBudgetGainLosses.push(performBudgetGainLoss);
        periodArrays.performAdjustedBudgetGainLosses.push(performAdjustedBudgetGainLoss);
        monthlyArrays.performBudgetGainLosses.push(performBudgetGainLoss);
        monthlyArrays.performAdjustedBudgetGainLosses.push(performAdjustedBudgetGainLoss);

        // Perform delivery rate details.
        console.log(format(new Date(), 'dd-MM-yyyy HH:mm:ss'), "calculating delivery rate");
        const performDeliveryRate = sharedPlanService.getPerformDeliveryRate({ date: payment.date, rateMap, forwardPointMap, hedgeMargin });
        console.log(format(new Date(), 'dd-MM-yyyy HH:mm:ss'), "after calculating delivery rate");
        periodArrays.performDeliveryRates.push(performDeliveryRate);
        monthlyArrays.performDeliveryRates.push(performDeliveryRate);

        // Perform delivery cost details.
        console.log(format(new Date(), 'dd-MM-yyyy HH:mm:ss'), "calculating delivery cost");
        const performDeliveryCost = numeral(payment.amount).divide(performDeliveryRate).value();
        periodArrays.performDeliveryCosts.push(performDeliveryCost);
        monthlyArrays.performDeliveryCosts.push(performDeliveryCost);
        console.log(format(new Date(), 'dd-MM-yyyy HH:mm:ss'), "after calculating delivery cost");

        // Perform delivery gain loss details.
        console.log(format(new Date(), 'dd-MM-yyyy HH:mm:ss'), "calculating delivery gain loss");
        const performDeliveryGainLoss = numeral(performDeliveryCost).subtract(payment.actualCost).value();
        periodArrays.performDeliveryGainLosses.push(performDeliveryGainLoss);
        monthlyArrays.performDeliveryGainLosses.push(performDeliveryGainLoss);
        console.log(format(new Date(), 'dd-MM-yyyy HH:mm:ss'), "after calculating delivery gain loss");

        // Perform return rate details.
        console.log(format(new Date(), 'dd-MM-yyyy HH:mm:ss'), "calculating return rate");
        const performReturnRate = sharedPaymentService.getReturnRate({ deliveryRate: performDeliveryRate, budgetRate: performBudgetRate });
        const performAdjustedReturnRate = sharedPaymentService.getReturnRate({
          deliveryRate: performDeliveryRate,
          budgetRate: performAdjustedBudgetRate,
        });
        console.log(format(new Date(), 'dd-MM-yyyy HH:mm:ss'), "after calculating return rate");
        periodArrays.performReturnRates.push(performReturnRate);
        periodArrays.performAdjustedReturnRates.push(performAdjustedReturnRate);
        monthlyArrays.performReturnRates.push(performReturnRate);
        monthlyArrays.performAdjustedReturnRates.push(performAdjustedReturnRate);
      });

      const totalBought = sum(monthlyArrays.raisedAmounts) || 0;
      const totalDeliveryCost = sum(monthlyArrays.deliveryCosts);
      const totalBudgetCost = sum(monthlyArrays.budgetCosts);
      const totalMinCost = sum(monthlyArrays.minCosts);
      const totalMaxCost = sum(monthlyArrays.maxCosts);
      const totalDeliveryGainLoss = sum(monthlyArrays.deliveryGainLosses);
      const averageDeliveryRate = mean(monthlyArrays.deliveryRates) || 0;

      // Disregard the potential gain if the monthly gain is less than 0. It's not a gain if you're losing money.
      console.log(format(new Date(), 'dd-MM-yyyy HH:mm:ss'), "Calculating potential gain for month", monthYear, "with totalBudgetCost", totalBudgetCost, "and totalMinCost", totalMinCost);
      const totalPotentialGain = numeral(totalBudgetCost).subtract(totalMinCost).value();
      if (totalPotentialGain > 0) {
        periodArrays.potentialGains.push(totalPotentialGain);
      }
      console.log(format(new Date(), 'dd-MM-yyyy HH:mm:ss'), "Total potential gain for month", monthYear, "is", totalPotentialGain);

      // Disregard the potential loss if the monthly loss is above 0. It's not a loss if you're making money.
      console.log(format(new Date(), 'dd-MM-yyyy HH:mm:ss'), "Calculating potential loss for month", monthYear, "with totalBudgetCost", totalBudgetCost, "and totalMaxCost", totalMaxCost);
      const totalPotentialLoss = numeral(totalBudgetCost).subtract(totalMaxCost).value();
      if (totalPotentialLoss < 0) {
        periodArrays.potentialLosses.push(totalPotentialLoss);
      }
      console.log(format(new Date(), 'dd-MM-yyyy HH:mm:ss'), "Total potential loss for month", monthYear, "is", totalPotentialLoss);

      const lastDayOfMonthMarketRate = sharedRateService.getRateOnDate({ rateMap, date: transaction.dateTo }).open;
      transaction.averageBudgetRate = mean(monthlyArrays.budgetRates) || 0;
      transaction.averageDeliveryRate = averageDeliveryRate;
      transaction.averageDeliveryCost = numeral(totalBought).divide(averageDeliveryRate).value() || 0;
      transaction.averageMarketRate = mean(monthlyArrays.marketRates) || 0;
      transaction.averagePastMargin = mean(monthlyArrays.pastMargins) || 0;
      transaction.averageReturnRate = mean(monthlyArrays.returnRates) || 0;
      transaction.averageAdjustedReturnRate = mean(monthlyArrays.adjustedReturnRates) || 0;
      transaction.medianPastMargin = sharedNumberService.median(monthlyArrays.pastMargins) || 0;
      transaction.fxCost = numeral(totalDeliveryCost).multiply(transaction.medianPastMargin).value() || 0;
      transaction.hedgedFxCost = numeral(totalDeliveryCost).multiply(hedgeMargin).value() || 0;
      transaction.maxCost = sum(monthlyArrays.maxCosts) || 0;
      transaction.maxRate = max(monthlyArrays.maxRates) || 0;
      transaction.minCost = sum(monthlyArrays.minCosts) || 0;
      transaction.minRate = min(monthlyArrays.minRates) || 0;
      transaction.potentialGain = totalPotentialGain || 0;
      transaction.potentialLoss = totalPotentialLoss || 0;
      transaction.bought = sum(monthlyArrays.raisedAmounts) || 0;
      transaction.budgetCost = totalBudgetCost || 0;
      transaction.deliveryCost = totalDeliveryCost || 0;
      transaction.deliveryGainLoss = totalDeliveryGainLoss || 0;
      transaction.deliveryGainLossMargin = numeral(totalDeliveryGainLoss).divide(totalDeliveryCost).value() || 0;

      transaction.performAverageBudgetRate = mean(monthlyArrays.performBudgetRates) || 0;
      transaction.performAverageDeliveryRate = mean(monthlyArrays.performDeliveryRates) || 0;
      transaction.performAverageReturnRate = mean(monthlyArrays.performReturnRates) || 0;
      transaction.performAverageAdjustedReturnRate = mean(monthlyArrays.performAdjustedReturnRates) || 0;
      transaction.performBudgetCost = sum(monthlyArrays.performBudgetCosts) || 0;
      transaction.performBudgetGainLoss = sum(monthlyArrays.performBudgetGainLosses) || 0;
      transaction.performBudgetGainLossMargin = numeral(transaction.performBudgetGainLoss).divide(totalDeliveryCost).value() || 0;
      transaction.performAdjustedBudgetCost = sum(monthlyArrays.performAdjustedBudgetCosts) || 0;
      transaction.performAdjustedBudgetGainLoss = sum(monthlyArrays.performAdjustedBudgetGainLosses) || 0;
      transaction.performAdjustedBudgetGainLossMargin = numeral(transaction.performAdjustedBudgetGainLoss).divide(totalDeliveryCost).value() || 0;
      transaction.performDeliveryCost = sum(monthlyArrays.performDeliveryCosts) || 0;
      transaction.performDeliveryGainLoss = sum(monthlyArrays.performDeliveryGainLosses) || 0;
      transaction.performDeliveryGainLossMargin = numeral(transaction.performDeliveryGainLoss).divide(totalDeliveryCost).value();

      if (monthlyArrays.deliveryRates.length) {
        lastDayOfMonthDeliveryRates.push(last(monthlyArrays.deliveryRates) as number);
      }

      if (monthlyArrays.performDeliveryRates.length) {
        lastDayOfMonthPerformDeliveryRates.push(last(monthlyArrays.performDeliveryRates) as number);
      }

      lastDayOfMonthMarketRates.push(lastDayOfMonthMarketRate);
    });

    const totalBought = sum(periodArrays.raisedAmounts) || 0;
    const totalDeliveryCost = sum(periodArrays.deliveryCosts) || 0;
    const totalBudgetCost = sum(periodArrays.budgetCosts) || 0;
    const totalDeliveryGainLoss = sum(periodArrays.deliveryGainLosses) || 0;
    const averagePastMargin = mean(periodArrays.pastMargins) || 0;
    const medianPastMargin = sharedNumberService.median(periodArrays.pastMargins) || 0;
    const averageDeliveryRate = mean(periodArrays.deliveryRates) || 0;

    // We only use the last 6 months of transactions to calculate the sharpe.
    const dateFrom6m = startOfMonth(sub(dateTo, { months: 7 }));
    const transactionsByMonth6m = filter(transactionsByMonth, (transaction) => {
      const { averageReturnRate, performAverageReturnRate, dateFrom } = transaction;

      // We only want to take into account months that have payments in them.
      return averageReturnRate && performAverageReturnRate && (isSameDay(dateFrom, dateFrom6m) || isAfter(dateFrom, dateFrom6m));
    });
    const adjustedReturnRateMap = map(transactionsByMonth6m, 'averageAdjustedReturnRate');
    const performAdjustedReturnRateMap = map(transactionsByMonth6m, 'performAverageAdjustedReturnRate');
    const stdDevAdjustedReturnRate = sharedNumberService.stdDev(adjustedReturnRateMap);
    const stdDevPerformAdjustedReturnRate = sharedNumberService.stdDev(performAdjustedReturnRateMap);
    const averageAdjustedReturnRate = mean(adjustedReturnRateMap) || 0;
    const averagePerformAdjustedReturnRate = mean(performAdjustedReturnRateMap) || 0;

    const sharpe = numeral(averageAdjustedReturnRate).divide(stdDevAdjustedReturnRate).value() || 0;
    const performSharpe = numeral(averagePerformAdjustedReturnRate).divide(stdDevPerformAdjustedReturnRate).value() || 0;
    const performSharpeRatio = numeral(sharpe).divide(performSharpe).value() || 0;

    const marketRateRisk = this.getRateRisk(lastDayOfMonthMarketRates);
    const marketProfitImpact = numeral(marketRateRisk).multiply(totalDeliveryCost).value() || 0;
    const deliveryRateRisk = this.getRateRisk(lastDayOfMonthDeliveryRates);

    const performDeliveryRateRisk = this.getRateRisk(lastDayOfMonthPerformDeliveryRates);
    const performBudgetGainLoss = sum(periodArrays.performBudgetGainLosses) || 0;
    const performAdjustedBudgetGainLoss = sum(periodArrays.performAdjustedBudgetGainLosses) || 0;
    const performDeliveryGainLoss = sum(periodArrays.performDeliveryGainLosses) || 0;

    console.log(format(new Date(), 'dd-MM-yyyy HH:mm:ss'), "Returning transaction breakdown");
    return {
      dateFrom,
      dateTo,
      averageBudgetRate: mean(periodArrays.budgetRates) || 0,
      averageDeliveryRate,
      averageDeliveryCost: numeral(totalBought).divide(averageDeliveryRate).value() || 0,
      averageMarketRate: mean(periodArrays.marketRates) || 0,
      averagePastMargin: averagePastMargin,
      averageReturnRate: mean(periodArrays.returnRates) || 0,
      averageAdjustedReturnRate: mean(periodArrays.adjustedReturnRates) || 0,
      fxCost: numeral(totalDeliveryCost).multiply(medianPastMargin).value() || 0,
      hedgedFxCost: numeral(totalDeliveryCost).multiply(hedgeMargin).value() || 0,
      maxCost: sum(periodArrays.maxCosts) || 0,
      maxRate: max(periodArrays.maxRates) || 0,
      medianPastMargin,
      minCost: sum(periodArrays.minCosts) || 0,
      minRate: min(periodArrays.minRates) || 0,
      potentialGain: sum(periodArrays.potentialGains) || 0,
      potentialLoss: sum(periodArrays.potentialLosses) || 0,
      bought: totalBought,
      budgetCost: totalBudgetCost || 0,
      deliveryCost: totalDeliveryCost || 0,
      deliveryGainLoss: totalDeliveryGainLoss || 0,
      deliveryGainLossMargin: numeral(totalDeliveryGainLoss).divide(totalDeliveryCost).value() || 0,
      deliveryRateRisk,
      marketProfitImpact,
      deliveryProfitImpact: numeral(deliveryRateRisk).multiply(totalDeliveryCost).value() || 0,
      marketRateRisk,

      performAverageBudgetRate: mean(periodArrays.performBudgetRates) || 0,
      performAverageDeliveryRate: mean(periodArrays.performDeliveryRates) || 0,
      performAverageReturnRate: mean(periodArrays.performReturnRates) || 0,
      performAverageAdjustedReturnRate: mean(periodArrays.performAdjustedReturnRates) || 0,
      performMarketProfitImpact: numeral(marketProfitImpact).multiply(performUnhedgedPercentage).value() || 0,
      performBudgetCost: sum(periodArrays.performBudgetCosts) || 0,
      performBudgetGainLoss,
      performBudgetGainLossMargin: numeral(performBudgetGainLoss).divide(totalDeliveryCost).value() || 0,
      performAdjustedBudgetCost: sum(periodArrays.performAdjustedBudgetCosts) || 0,
      performAdjustedBudgetGainLoss,
      performAdjustedBudgetGainLossMargin: numeral(performAdjustedBudgetGainLoss).divide(totalDeliveryCost).value() || 0,
      performDeliveryCost: sum(periodArrays.performDeliveryCosts) || 0,
      performDeliveryGainLoss,
      performDeliveryGainLossMargin: numeral(performDeliveryGainLoss).divide(totalDeliveryCost).value(),
      performDeliveryProfitImpact: numeral(performDeliveryRateRisk).multiply(totalDeliveryCost).value() || 0,
      performDeliveryRateRisk,
      sharpe,
      performSharpe,
      performSharpeRatio,
      transactionsByMonth,
    };
  };

  getTransactionDetailGroupedByMonthCollection = (param: DateRangeParam): TransactionDetailsByMonthType[] => {
    console.log( "Getting transaction details grouped by month collection" );
    return map(sharedDateTimeService.getCollectionGroupedByMonthYear(param), (item) => ({
      ...item,
      averageBudgetRate: 0,
      averageDeliveryRate: 0,
      averageDeliveryCost: 0,
      averageMarketRate: 0,
      averagePastMargin: 0,
      averageReturnRate: 0,
      averageAdjustedReturnRate: 0,
      fxCost: 0,
      hedgedFxCost: 0,
      maxCost: 0,
      maxRate: 0,
      medianPastMargin: 0,
      minCost: 0,
      minRate: 0,
      potentialGain: 0,
      potentialLoss: 0,
      bought: 0,
      budgetCost: 0,
      deliveryCost: 0,
      deliveryGainLoss: 0,
      deliveryGainLossMargin: 0,

      performAverageBudgetRate: 0,
      performAverageDeliveryRate: 0,
      performAverageReturnRate: 0,
      performAverageAdjustedReturnRate: 0,
      performBudgetCost: 0,
      performBudgetGainLoss: 0,
      performBudgetGainLossMargin: 0,
      performAdjustedBudgetCost: 0,
      performAdjustedBudgetGainLoss: 0,
      performAdjustedBudgetGainLossMargin: 0,
      performDeliveryCost: 0,
      performDeliveryGainLoss: 0,
      performDeliveryGainLossMargin: 0,
      performMarketProfitImpact: 0,
    }));
  };

  getTransactionArrays = () => ({
    raisedAmounts: [] as number[],
    budgetRates: [] as number[],
    budgetCosts: [] as number[],
    pastMargins: [] as number[],
    maxRates: [] as number[],
    maxCosts: [] as number[],
    minRates: [] as number[],
    minCosts: [] as number[],
    marketRates: [] as number[],
    deliveryRates: [] as number[],
    deliveryCosts: [] as number[],
    deliveryGainLosses: [] as number[],
    returnRates: [] as number[],
    adjustedReturnRates: [] as number[],

    performBudgetRates: [] as number[],
    performBudgetCosts: [] as number[],
    performBudgetGainLosses: [] as number[],
    performAdjustedBudgetRates: [] as number[],
    performAdjustedBudgetCosts: [] as number[],
    performAdjustedBudgetGainLosses: [] as number[],
    performDeliveryRates: [] as number[],
    performDeliveryCosts: [] as number[],
    performDeliveryGainLosses: [] as number[],
    performReturnRates: [] as number[],
    performAdjustedReturnRates: [] as number[],
  });

  getRateRisk = (rates: number[]) => {
    const rateDeltas: number[] = [];
    console.log( "Getting rate riske" );

    forEach(rates, (rate, index) => {
      const nextRate = rates[index + 1];

      if (nextRate) {
        const percentage = numeral(nextRate).divide(rate).value();

        rateDeltas.push(numeral(1).subtract(percentage).value());
      }
    });

    const deltaStdDev = sharedNumberService.stdDev(rateDeltas);

    return numeral(deltaStdDev).multiply(Math.sqrt(6)).value() || 0;
  };
}

export const sharedTransactionService = new SharedTransactionService();
