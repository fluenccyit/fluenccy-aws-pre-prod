import numeral from 'numeral';
import { format, parse, startOfMonth, sub } from 'date-fns';
import { SHARED_DATE_TIME_FORMAT } from '@shared/common';
import { ForwardPointMapByDate, RateMapByDate, sharedRateService } from '@shared/rate';
import { PLAN_PERFORM_BUDGET_RATE_SCORE_PAYABLES_ADJUSTMENT, PLAN_PERFORM_PERIOD_ADJUSTMENT } from '@shared/plan';

type GetInitialPerformBudgetRateFromDateParam = {
  monthYear: string;
};

type GetPerformBudgetRateParam = {
  monthYear: string;
  rateMap: RateMapByDate;
  isAdjusted?: boolean;
};

type GetPerformDeliveryRateParam = {
  rateMap: RateMapByDate;
  forwardPointMap: ForwardPointMapByDate;
  date: Date;
  hedgeMargin: number;
};

class SharedPlanService {
  getInitialPerformBudgetRateDateFromMonthYear = ({ monthYear }: GetInitialPerformBudgetRateFromDateParam) => {
    let date = startOfMonth(parse(monthYear, SHARED_DATE_TIME_FORMAT.monthYear, new Date()));
    let formattedDate = format(date, SHARED_DATE_TIME_FORMAT.month);

    while (formattedDate !== 'Jan' && formattedDate !== 'Jul') {
      date = startOfMonth(sub(date, { months: 1 }));
      formattedDate = format(date, SHARED_DATE_TIME_FORMAT.month);
    }

    return format(date, SHARED_DATE_TIME_FORMAT.monthYear);
  };

  getPerformBudgetRate = ({ monthYear, rateMap, isAdjusted }: GetPerformBudgetRateParam) => {
    const date = startOfMonth(parse(monthYear, SHARED_DATE_TIME_FORMAT.monthYear, new Date()));
    const rateOnDate = sharedRateService.getRateOnDate({ rateMap, date });

    return isAdjusted ? numeral(rateOnDate.open).multiply(PLAN_PERFORM_BUDGET_RATE_SCORE_PAYABLES_ADJUSTMENT).value() : rateOnDate.open;
  };

  getPerformDeliveryRate = ({ rateMap, forwardPointMap, date, hedgeMargin }: GetPerformDeliveryRateParam) => {
    const date6m = sub(date, { months: 6 });
    const date4m = sub(date, { months: 4 });
    const date2m = sub(date, { months: 2 });

    const fxRate6m = sharedRateService.getRateOnDate({ rateMap, date: date6m });
    const fxRate4m = sharedRateService.getRateOnDate({ rateMap, date: date4m });
    const fxRate2m = sharedRateService.getRateOnDate({ rateMap, date: date2m });
    const fxRatePaid = sharedRateService.getRateOnDate({ rateMap, date });
    const forwardRate6m = sharedRateService.getForwardPointOnDate({ forwardPointMap, date: date6m });
    const forwardRate4m = sharedRateService.getForwardPointOnDate({ forwardPointMap, date: date4m });
    const forwardRate2m = sharedRateService.getForwardPointOnDate({ forwardPointMap, date: date2m });
    const forwardRate6mPortion = numeral(forwardRate6m.forwardPoints).multiply(6).value();
    const forwardRate4mPortion = numeral(forwardRate4m.forwardPoints).multiply(4).value();
    const forwardRate2mPortion = numeral(forwardRate2m.forwardPoints).multiply(2).value();

    // @TODO: We will need to support adjustments per currency pair.
    const fxRatePortion6m = numeral(fxRate6m.open).add(forwardRate6mPortion).multiply(PLAN_PERFORM_PERIOD_ADJUSTMENT[6]).value();
    const fxRatePortion4m = numeral(fxRate4m.open).add(forwardRate4mPortion).multiply(PLAN_PERFORM_PERIOD_ADJUSTMENT[4]).value();
    const fxRatePortion2m = numeral(fxRate2m.open).add(forwardRate2mPortion).multiply(PLAN_PERFORM_PERIOD_ADJUSTMENT[2]).value();
    const fxRatePortionPaid = numeral(fxRatePaid.open).multiply(PLAN_PERFORM_PERIOD_ADJUSTMENT.spot).value();

    const hedgeAdjustment = numeral(1).subtract(hedgeMargin).value();
    const performDeliveryRate = numeral(fxRatePortion6m).add(fxRatePortion4m).add(fxRatePortion2m).add(fxRatePortionPaid).value();

    return numeral(hedgeAdjustment).multiply(performDeliveryRate).value();
  };

  getPerformHedgedPercentage = () => {
    const portion6m = numeral(PLAN_PERFORM_PERIOD_ADJUSTMENT[6]).multiply(6).value();
    const portion4m = numeral(PLAN_PERFORM_PERIOD_ADJUSTMENT[4]).multiply(4).value();
    const portion2m = numeral(PLAN_PERFORM_PERIOD_ADJUSTMENT[2]).multiply(2).value();

    return numeral(portion6m).add(portion4m).add(portion2m).divide(12).value();
  };

  getPerformUnhedgedPercentage = () => {
    return numeral(1).subtract(this.getPerformHedgedPercentage()).value();
  };
}

export const sharedPlanService = new SharedPlanService();
