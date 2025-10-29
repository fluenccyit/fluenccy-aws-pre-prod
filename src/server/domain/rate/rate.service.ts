import numeral from 'numeral';
import { isSameDay } from 'date-fns';
import { filter, find, forEach, includes, map } from 'lodash';
import { GqlSupportedCurrency } from '@graphql';
import { DATE_TIME_FORMAT, dateService } from '@server/common';
import { RateMapByDate, sharedRateService } from '@shared/rate';
import {
  CURRENCY_PRIORITY,
  RateDbo,
  RateModel,
  STORED_CURRENCY_PAIRS_INVERTED,
  STORED_CURRENCY_PAIRS,
  ForwardPointDbo,
  ForwardPointModel,
  ForwardRateModel,
  BaseRate,
} from '@server/rate';

type GetRatesParam = {
  rates: RateModel[];
  baseCurrency: GqlSupportedCurrency;
  tradeCurrency: GqlSupportedCurrency;
};

type GetForwardPointsParam = {
  rates: RateModel[];
  forwardPoints: ForwardPointModel[];
  baseCurrency: GqlSupportedCurrency;
  tradeCurrency: GqlSupportedCurrency;
};

type GetForwardRatesParam = {
  rateMap: RateMapByDate;
  forwardPoints: ForwardPointModel[];
};

type GetCrossForwardRatesParam = {
  rates: RateModel[];
  forwardPoints: ForwardPointModel[];
  baseCurrency: GqlSupportedCurrency;
  tradeCurrency: GqlSupportedCurrency;
};

class RateService {
  getRatesByCurrencyPair = ({ rates, baseCurrency, tradeCurrency }: GetRatesParam) => {
    const currencyPair = `${baseCurrency}/${tradeCurrency}`;

    if (includes(STORED_CURRENCY_PAIRS, currencyPair)) {
      return filter(rates, { baseCurrency, tradeCurrency });
    } else if (includes(STORED_CURRENCY_PAIRS_INVERTED, currencyPair)) {
      return map(filter(rates, { baseCurrency, tradeCurrency }), this.getInversedRate);
    } else {
      return this.getCrossRates({ rates, baseCurrency, tradeCurrency });
    }
  };

  getCrossRates = ({ rates, baseCurrency, tradeCurrency }: GetRatesParam) => {
    const baseRatesAgainstUsd = this.getBaseRates(rates, baseCurrency);
    const tradeRatesAgainstUsd = this.getTradeRates(rates, tradeCurrency);
    const crossRates: RateModel[] = [];

    forEach(baseRatesAgainstUsd, (baseRate) => {
      const tradeRate = find(tradeRatesAgainstUsd, ({ date: tradeDate }) => isSameDay(tradeDate, baseRate.date));

      // This should never happen, but if we can't find a trade rate on the same day as the base rate, then we can't perform this calculation, so bail
      // out.
      if (!tradeRate) {
        return;
      }

      const baseRateToUse = rateService.hasLowerPriority(baseCurrency, 'USD') ? this.getInversedRate(baseRate) : baseRate;
      const tradeRateToUse = rateService.hasLowerPriority(tradeCurrency, 'USD') ? this.getInversedRate(tradeRate) : tradeRate;

      crossRates.push({
        ...baseRate,
        baseCurrency,
        tradeCurrency,
        high: numeral(baseRateToUse.high).divide(tradeRateToUse.high).value(),
        last: numeral(baseRateToUse.last).divide(tradeRateToUse.last).value(),
        low: numeral(baseRateToUse.low).divide(tradeRateToUse.low).value(),
        open: numeral(baseRateToUse.open).divide(tradeRateToUse.open).value(),
      });
    });

    return crossRates;
  };

  getForwardPointsByCurrencyPair = ({ rates, forwardPoints, baseCurrency, tradeCurrency }: GetForwardPointsParam) => {
    const currencyPair = `${baseCurrency}/${tradeCurrency}`;

    if (includes(STORED_CURRENCY_PAIRS, currencyPair)) {
      return filter(forwardPoints, { baseCurrency, tradeCurrency });
    } else if (includes(STORED_CURRENCY_PAIRS_INVERTED, currencyPair)) {
      return this.getInvertedForwardPoints({ rates, forwardPoints, baseCurrency, tradeCurrency });
    } else {
      return this.getCrossForwardPoints({ rates, forwardPoints, baseCurrency, tradeCurrency });
    }
  };

  getInvertedForwardPoints = ({ rates, forwardPoints, baseCurrency, tradeCurrency }: GetForwardPointsParam) => {
    const rateMap = sharedRateService.generateRateMap(map(filter(rates, { baseCurrency, tradeCurrency }), this.getInversedRate));
    const filteredForwardPoints = filter(forwardPoints, { baseCurrency, tradeCurrency });
    const invertedForwardRates = map(this.getForwardRates({ rateMap, forwardPoints: filteredForwardPoints }), this.getInversedForwardRate);

    const forwardPointsByCurrencyPair: ForwardPointModel[] = [];
    forEach(invertedForwardRates, (forwardRate) => {
      const rate = sharedRateService.getRateOnDate({ rateMap, date: forwardRate.date });

      forwardPointsByCurrencyPair.push({
        ...forwardRate,
        forwardPoints: numeral(forwardRate.forwardRate).subtract(rate.open).value(),
      });
    });

    return forwardPointsByCurrencyPair;
  };

  getForwardRates = ({ rateMap, forwardPoints }: GetForwardRatesParam) => {
    const forwardRates: ForwardRateModel[] = [];

    forEach(forwardPoints, (forwardPoint) => {
      const rate = sharedRateService.getRateOnDate({ rateMap, date: forwardPoint.date });

      forwardRates.push({
        ...forwardPoint,
        forwardRate: numeral(rate.open).add(forwardPoint.forwardPoints).value(),
      });
    });

    return forwardRates;
  };

  getCrossForwardPoints = ({ rates, forwardPoints, baseCurrency, tradeCurrency }: GetCrossForwardRatesParam) => {
    const baseRateMapAgainstUsd = sharedRateService.generateRateMap(this.getBaseRates(rates, baseCurrency));
    const tradeRateMapAgainstUsd = sharedRateService.generateRateMap(this.getTradeRates(rates, tradeCurrency));
    const baseForwardPointsAgainstUsd = this.getBaseRates<ForwardPointModel>(forwardPoints, baseCurrency);
    const tradeForwardPointsAgainstUsd = this.getTradeRates<ForwardPointModel>(forwardPoints, tradeCurrency);
    const baseForwardRatesAgainstUsd = this.getForwardRates({ rateMap: baseRateMapAgainstUsd, forwardPoints: baseForwardPointsAgainstUsd });
    const tradeForwardRatesAgainstUsd = this.getForwardRates({ rateMap: tradeRateMapAgainstUsd, forwardPoints: tradeForwardPointsAgainstUsd });
    const crossForwardPoints: ForwardPointModel[] = [];

    forEach(baseForwardRatesAgainstUsd, (baseForwardRate) => {
      const tradeForwardRate = find(tradeForwardRatesAgainstUsd, ({ date }) => isSameDay(date, baseForwardRate.date));

      // This should never happen, but if we can't find a trade rate on the same day as the base rate, then we can't perform this calculation, so bail
      // out.
      if (!tradeForwardRate) {
        return;
      }

      const baseRate = sharedRateService.getRateOnDate({ rateMap: baseRateMapAgainstUsd, date: baseForwardRate.date });
      const tradeRate = sharedRateService.getRateOnDate({ rateMap: tradeRateMapAgainstUsd, date: baseForwardRate.date });
      const baseRateToUse = this.hasLowerPriority(baseCurrency, 'USD') ? this.getInversedRate(baseRate) : baseRate;
      const tradeRateToUse = this.hasLowerPriority(tradeCurrency, 'USD') ? this.getInversedRate(tradeRate) : tradeRate;
      const baseForwardRateToUse = this.hasLowerPriority(baseCurrency, 'USD') ? this.getInversedForwardRate(baseForwardRate) : baseForwardRate;
      const tradeForwardRateToUse = this.hasLowerPriority(tradeCurrency, 'USD') ? this.getInversedForwardRate(tradeForwardRate) : tradeForwardRate;
      const forwardCrossRate = numeral(baseForwardRateToUse.forwardRate).divide(tradeForwardRateToUse.forwardRate).value();
      const crossRate = numeral(baseRateToUse.open).divide(tradeRateToUse.open).value();

      crossForwardPoints.push({
        ...baseForwardRate,
        baseCurrency,
        tradeCurrency,
        forwardPoints: numeral(forwardCrossRate).subtract(crossRate).value(),
      });
    });

    return crossForwardPoints;
  };

  getInversedRate = (rate: RateModel): RateModel => ({
    ...rate,
    high: numeral(1).divide(rate.high).value(),
    last: numeral(1).divide(rate.last).value(),
    low: numeral(1).divide(rate.low).value(),
    open: numeral(1).divide(rate.open).value(),
  });

  getInversedForwardRate = (forwardRate: ForwardRateModel): ForwardRateModel => ({
    ...forwardRate,
    forwardRate: numeral(1).divide(forwardRate.forwardRate).value(),
  });

  getBaseRates<T extends BaseRate>(rates: T[], baseCurrency: GqlSupportedCurrency): T[] {
    return this.hasHigherPriority(baseCurrency, 'USD')
      ? (filter(rates, { baseCurrency }) as T[])
      : (filter(rates, { tradeCurrency: baseCurrency }) as T[]);
  }

  getTradeRates<T extends BaseRate>(rates: T[], tradeCurrency: GqlSupportedCurrency): T[] {
    return tradeCurrency === 'USD' || this.hasHigherPriority(tradeCurrency, 'USD')
      ? (filter(rates, { baseCurrency: tradeCurrency }) as T[])
      : (filter(rates, { tradeCurrency }) as T[]);
  }

  hasHigherPriority = (firstCurrency: GqlSupportedCurrency, secondCurrency: GqlSupportedCurrency) => {
    return CURRENCY_PRIORITY[firstCurrency] < CURRENCY_PRIORITY[secondCurrency];
  };

  hasLowerPriority = (firstCurrency: GqlSupportedCurrency, secondCurrency: GqlSupportedCurrency) => {
    return CURRENCY_PRIORITY[firstCurrency] > CURRENCY_PRIORITY[secondCurrency];
  };

  convertRateDboToModel = (rateDbo: RateDbo): RateModel => ({
    ...rateDbo,
    date: dateService.parseDate(rateDbo.date, DATE_TIME_FORMAT.postgresDate),
    high: numeral(rateDbo.high).value(),
    last: numeral(rateDbo.last).value(),
    low: numeral(rateDbo.low).value(),
    open: numeral(rateDbo.open).value(),
  });

  convertForwardPointDboToModel = (forwardPointDbo: ForwardPointDbo): ForwardPointModel => ({
    ...forwardPointDbo,
    date: dateService.parseDate(forwardPointDbo.date, DATE_TIME_FORMAT.postgresDate),
    // The forward points we store in the DB are 1000x the rate they represent, because they are generally 0.000x. So we are scaling them up in this
    // converter, as we always want to interact with them in this form.
    forwardPoints: numeral(forwardPointDbo.forwardPoints).multiply(0.0001).value(),
  });
}

export const rateService = new RateService();
