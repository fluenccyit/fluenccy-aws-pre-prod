import numeral from 'numeral';
import { GqlSupportedCurrency } from '@graphql';
import { RateModel, rateService } from '@server/rate';
import { MOCK_AUD_USD_RATES, MOCK_EUR_USD_RATES, MOCK_GBP_USD_RATES, MOCK_NZD_USD_RATES, MOCK_USD_JPY_RATES, MOCK_USD_CAD_RATES } from './rate.mocks';

describe('@server/rate | rateService', () => {
  describe('#hasHigherPriority', () => {
    const { hasHigherPriority } = rateService;

    it('should return `true` for all first currencies higher priority than the second currency', () => {
      expect(hasHigherPriority('EUR', 'GBP')).toBe(true);
      expect(hasHigherPriority('EUR', 'AUD')).toBe(true);
      expect(hasHigherPriority('EUR', 'NZD')).toBe(true);
      expect(hasHigherPriority('EUR', 'USD')).toBe(true);
      expect(hasHigherPriority('EUR', 'JPY')).toBe(true);
      expect(hasHigherPriority('EUR', 'CAD')).toBe(true);

      expect(hasHigherPriority('GBP', 'AUD')).toBe(true);
      expect(hasHigherPriority('GBP', 'NZD')).toBe(true);
      expect(hasHigherPriority('GBP', 'USD')).toBe(true);
      expect(hasHigherPriority('GBP', 'JPY')).toBe(true);
      expect(hasHigherPriority('GBP', 'CAD')).toBe(true);

      expect(hasHigherPriority('AUD', 'NZD')).toBe(true);
      expect(hasHigherPriority('AUD', 'USD')).toBe(true);
      expect(hasHigherPriority('AUD', 'JPY')).toBe(true);
      expect(hasHigherPriority('AUD', 'CAD')).toBe(true);

      expect(hasHigherPriority('NZD', 'USD')).toBe(true);
      expect(hasHigherPriority('NZD', 'JPY')).toBe(true);
      expect(hasHigherPriority('NZD', 'CAD')).toBe(true);

      expect(hasHigherPriority('USD', 'JPY')).toBe(true);
      expect(hasHigherPriority('USD', 'CAD')).toBe(true);

      expect(hasHigherPriority('JPY', 'CAD')).toBe(true);
    });

    it('should return `false` for all first currencies lower priority than the second currency', () => {
      expect(hasHigherPriority('CAD', 'JPY')).toBe(false);
      expect(hasHigherPriority('CAD', 'USD')).toBe(false);
      expect(hasHigherPriority('CAD', 'NZD')).toBe(false);
      expect(hasHigherPriority('CAD', 'AUD')).toBe(false);
      expect(hasHigherPriority('CAD', 'GBP')).toBe(false);
      expect(hasHigherPriority('CAD', 'EUR')).toBe(false);

      expect(hasHigherPriority('JPY', 'USD')).toBe(false);
      expect(hasHigherPriority('JPY', 'NZD')).toBe(false);
      expect(hasHigherPriority('JPY', 'AUD')).toBe(false);
      expect(hasHigherPriority('JPY', 'GBP')).toBe(false);
      expect(hasHigherPriority('JPY', 'EUR')).toBe(false);

      expect(hasHigherPriority('USD', 'NZD')).toBe(false);
      expect(hasHigherPriority('USD', 'AUD')).toBe(false);
      expect(hasHigherPriority('USD', 'GBP')).toBe(false);
      expect(hasHigherPriority('USD', 'EUR')).toBe(false);

      expect(hasHigherPriority('NZD', 'AUD')).toBe(false);
      expect(hasHigherPriority('NZD', 'GBP')).toBe(false);
      expect(hasHigherPriority('NZD', 'EUR')).toBe(false);

      expect(hasHigherPriority('AUD', 'GBP')).toBe(false);
      expect(hasHigherPriority('AUD', 'EUR')).toBe(false);

      expect(hasHigherPriority('GBP', 'EUR')).toBe(false);
    });

    it('should return `false` when passed the same currency', () => {
      expect(hasHigherPriority('USD', 'USD')).toBe(false);
      expect(hasHigherPriority('NZD', 'NZD')).toBe(false);
      expect(hasHigherPriority('AUD', 'AUD')).toBe(false);
      expect(hasHigherPriority('GBP', 'GBP')).toBe(false);
      expect(hasHigherPriority('EUR', 'EUR')).toBe(false);
      expect(hasHigherPriority('JPY', 'JPY')).toBe(false);
      expect(hasHigherPriority('CAD', 'CAD')).toBe(false);
    });
  });

  describe('#getCrossRates', () => {
    type RunCrossRateAssertionParam = {
      crossRates: RateModel[];
      baseRate: RateModel;
      tradeRate: RateModel;
      baseCurrency: GqlSupportedCurrency;
      tradeCurrency: GqlSupportedCurrency;
    };

    type AssertCrossRatesParam = {
      baseRate: RateModel;
      tradeRate: RateModel;
      baseCurrency: GqlSupportedCurrency;
      tradeCurrency: GqlSupportedCurrency;
    };

    const runCrossRateAssertion = (param: RunCrossRateAssertionParam) => {
      const { crossRates, baseRate, tradeRate, baseCurrency, tradeCurrency } = param;
      const expectedOpen = numeral(baseRate.open).divide(tradeRate.open).value();
      const expectedHigh = numeral(baseRate.high).divide(tradeRate.high).value();
      const expectedLow = numeral(baseRate.low).divide(tradeRate.low).value();
      const expectedLast = numeral(baseRate.last).divide(tradeRate.last).value();

      expect(crossRates[0].baseCurrency).toEqual(baseCurrency);
      expect(crossRates[0].tradeCurrency).toEqual(tradeCurrency);
      expect(crossRates[0].open).toEqual(expectedOpen);
      expect(crossRates[0].high).toEqual(expectedHigh);
      expect(crossRates[0].low).toEqual(expectedLow);
      expect(crossRates[0].last).toEqual(expectedLast);
    };

    const assertStandardCrossRates = (param: AssertCrossRatesParam) => {
      const { baseRate, tradeRate, baseCurrency, tradeCurrency } = param;
      const crossRates = rateService.getCrossRates({
        rates: [baseRate, tradeRate],
        baseCurrency: baseCurrency,
        tradeCurrency: tradeCurrency,
      });

      runCrossRateAssertion({ crossRates, baseRate, tradeRate, baseCurrency, tradeCurrency });
    };

    const assertTradeInverseCrossRates = (param: AssertCrossRatesParam) => {
      const { baseRate, tradeRate, baseCurrency, tradeCurrency } = param;
      const crossRates = rateService.getCrossRates({
        rates: [baseRate, tradeRate],
        baseCurrency: baseCurrency,
        tradeCurrency: tradeCurrency,
      });

      const inversedTradeRate = rateService.getInversedRate(tradeRate);

      runCrossRateAssertion({ crossRates, baseRate, tradeRate: inversedTradeRate, baseCurrency, tradeCurrency });
    };

    const assertBaseInverseCrossRates = (param: AssertCrossRatesParam) => {
      const { baseRate, tradeRate, baseCurrency, tradeCurrency } = param;
      const crossRates = rateService.getCrossRates({
        rates: [baseRate, tradeRate],
        baseCurrency: baseCurrency,
        tradeCurrency: tradeCurrency,
      });

      const inverseBaseRates = rateService.getInversedRate(baseRate);

      runCrossRateAssertion({ crossRates, baseRate: inverseBaseRates, tradeRate, baseCurrency, tradeCurrency });
    };

    const assertInvertedCrossRates = (param: AssertCrossRatesParam) => {
      const { baseRate, tradeRate, baseCurrency, tradeCurrency } = param;
      const crossRates = rateService.getCrossRates({
        rates: [baseRate, tradeRate],
        baseCurrency: baseCurrency,
        tradeCurrency: tradeCurrency,
      });

      const inverseBaseRates = rateService.getInversedRate(baseRate);
      const inverseTradeRates = rateService.getInversedRate(tradeRate);

      runCrossRateAssertion({
        crossRates,
        baseRate: inverseBaseRates,
        tradeRate: inverseTradeRates,
        baseCurrency,
        tradeCurrency,
      });
    };

    it('should correctly get the cross rates of NZD/AUD', () => {
      assertStandardCrossRates({
        baseRate: MOCK_NZD_USD_RATES[0],
        tradeRate: MOCK_AUD_USD_RATES[0],
        baseCurrency: 'NZD',
        tradeCurrency: 'AUD',
      });
    });

    it('should correctly get the cross rates of NZD/CAD', () => {
      assertTradeInverseCrossRates({
        baseRate: MOCK_NZD_USD_RATES[0],
        tradeRate: MOCK_USD_CAD_RATES[0],
        baseCurrency: 'NZD',
        tradeCurrency: 'CAD',
      });
    });

    it('should correctly get the cross rates of NZD/JPY', () => {
      assertTradeInverseCrossRates({
        baseRate: MOCK_NZD_USD_RATES[0],
        tradeRate: MOCK_USD_JPY_RATES[0],
        baseCurrency: 'NZD',
        tradeCurrency: 'JPY',
      });
    });

    it('should correctly get the cross rates of NZD/EUR', () => {
      assertStandardCrossRates({
        baseRate: MOCK_NZD_USD_RATES[0],
        tradeRate: MOCK_EUR_USD_RATES[0],
        baseCurrency: 'NZD',
        tradeCurrency: 'EUR',
      });
    });

    it('should correctly get the cross rates of NZD/GBP', () => {
      assertStandardCrossRates({
        baseRate: MOCK_NZD_USD_RATES[0],
        tradeRate: MOCK_GBP_USD_RATES[0],
        baseCurrency: 'NZD',
        tradeCurrency: 'GBP',
      });
    });

    it('should correctly get the cross rates of AUD/NZD', () => {
      assertStandardCrossRates({
        baseRate: MOCK_AUD_USD_RATES[0],
        tradeRate: MOCK_NZD_USD_RATES[0],
        baseCurrency: 'AUD',
        tradeCurrency: 'NZD',
      });
    });

    it('should correctly get the cross rates of AUD/CAD', () => {
      assertTradeInverseCrossRates({
        baseRate: MOCK_AUD_USD_RATES[0],
        tradeRate: MOCK_USD_CAD_RATES[0],
        baseCurrency: 'AUD',
        tradeCurrency: 'CAD',
      });
    });

    it('should correctly get the cross rates of AUD/JPY', () => {
      assertTradeInverseCrossRates({
        baseRate: MOCK_AUD_USD_RATES[0],
        tradeRate: MOCK_USD_JPY_RATES[0],
        baseCurrency: 'AUD',
        tradeCurrency: 'JPY',
      });
    });

    it('should correctly get the cross rates of AUD/EUR', () => {
      assertStandardCrossRates({
        baseRate: MOCK_AUD_USD_RATES[0],
        tradeRate: MOCK_EUR_USD_RATES[0],
        baseCurrency: 'AUD',
        tradeCurrency: 'EUR',
      });
    });

    it('should correctly get the cross rates of AUD/GBP', () => {
      assertStandardCrossRates({
        baseRate: MOCK_AUD_USD_RATES[0],
        tradeRate: MOCK_GBP_USD_RATES[0],
        baseCurrency: 'AUD',
        tradeCurrency: 'GBP',
      });
    });

    it('should correctly get the cross rates of CAD/NZD', () => {
      assertBaseInverseCrossRates({
        baseRate: MOCK_USD_CAD_RATES[0],
        tradeRate: MOCK_NZD_USD_RATES[0],
        baseCurrency: 'CAD',
        tradeCurrency: 'NZD',
      });
    });

    it('should correctly get the cross rates of CAD/AUD', () => {
      assertBaseInverseCrossRates({
        baseRate: MOCK_USD_CAD_RATES[0],
        tradeRate: MOCK_AUD_USD_RATES[0],
        baseCurrency: 'CAD',
        tradeCurrency: 'AUD',
      });
    });

    it('should correctly get the cross rates of CAD/JPY', () => {
      assertInvertedCrossRates({
        baseRate: MOCK_USD_CAD_RATES[0],
        tradeRate: MOCK_USD_JPY_RATES[0],
        baseCurrency: 'CAD',
        tradeCurrency: 'JPY',
      });
    });

    it('should correctly get the cross rates of CAD/EUR', () => {
      assertBaseInverseCrossRates({
        baseRate: MOCK_USD_CAD_RATES[0],
        tradeRate: MOCK_EUR_USD_RATES[0],
        baseCurrency: 'CAD',
        tradeCurrency: 'EUR',
      });
    });

    it('should correctly get the cross rates of CAD/GBP', () => {
      assertBaseInverseCrossRates({
        baseRate: MOCK_USD_CAD_RATES[0],
        tradeRate: MOCK_GBP_USD_RATES[0],
        baseCurrency: 'CAD',
        tradeCurrency: 'GBP',
      });
    });

    it('should correctly get the cross rates of JPY/NZD', () => {
      assertBaseInverseCrossRates({
        baseRate: MOCK_USD_JPY_RATES[0],
        tradeRate: MOCK_NZD_USD_RATES[0],
        baseCurrency: 'JPY',
        tradeCurrency: 'NZD',
      });
    });

    it('should correctly get the cross rates of JPY/AUD', () => {
      assertBaseInverseCrossRates({
        baseRate: MOCK_USD_JPY_RATES[0],
        tradeRate: MOCK_AUD_USD_RATES[0],
        baseCurrency: 'JPY',
        tradeCurrency: 'AUD',
      });
    });

    it('should correctly get the cross rates of JPY/CAD', () => {
      assertInvertedCrossRates({
        baseRate: MOCK_USD_JPY_RATES[0],
        tradeRate: MOCK_USD_CAD_RATES[0],
        baseCurrency: 'JPY',
        tradeCurrency: 'CAD',
      });
    });

    it('should correctly get the cross rates of JPY/EUR', () => {
      assertBaseInverseCrossRates({
        baseRate: MOCK_USD_JPY_RATES[0],
        tradeRate: MOCK_EUR_USD_RATES[0],
        baseCurrency: 'JPY',
        tradeCurrency: 'EUR',
      });
    });

    it('should correctly get the cross rates of JPY/GBP', () => {
      assertBaseInverseCrossRates({
        baseRate: MOCK_USD_JPY_RATES[0],
        tradeRate: MOCK_GBP_USD_RATES[0],
        baseCurrency: 'JPY',
        tradeCurrency: 'GBP',
      });
    });

    it('should correctly get the cross rates of EUR/NZD', () => {
      assertStandardCrossRates({
        baseRate: MOCK_EUR_USD_RATES[0],
        tradeRate: MOCK_NZD_USD_RATES[0],
        baseCurrency: 'EUR',
        tradeCurrency: 'NZD',
      });
    });

    it('should correctly get the cross rates of EUR/AUD', () => {
      assertStandardCrossRates({
        baseRate: MOCK_EUR_USD_RATES[0],
        tradeRate: MOCK_AUD_USD_RATES[0],
        baseCurrency: 'EUR',
        tradeCurrency: 'AUD',
      });
    });

    it('should correctly get the cross rates of EUR/CAD', () => {
      assertTradeInverseCrossRates({
        baseRate: MOCK_EUR_USD_RATES[0],
        tradeRate: MOCK_USD_CAD_RATES[0],
        baseCurrency: 'EUR',
        tradeCurrency: 'CAD',
      });
    });

    it('should correctly get the cross rates of EUR/JPY', () => {
      assertTradeInverseCrossRates({
        baseRate: MOCK_EUR_USD_RATES[0],
        tradeRate: MOCK_USD_JPY_RATES[0],
        baseCurrency: 'EUR',
        tradeCurrency: 'JPY',
      });
    });

    it('should correctly get the cross rates of EUR/GBP', () => {
      assertStandardCrossRates({
        baseRate: MOCK_EUR_USD_RATES[0],
        tradeRate: MOCK_GBP_USD_RATES[0],
        baseCurrency: 'EUR',
        tradeCurrency: 'GBP',
      });
    });

    it('should correctly get the cross rates of GBP/NZD', () => {
      assertStandardCrossRates({
        baseRate: MOCK_GBP_USD_RATES[0],
        tradeRate: MOCK_NZD_USD_RATES[0],
        baseCurrency: 'GBP',
        tradeCurrency: 'NZD',
      });
    });

    it('should correctly get the cross rates of GBP/AUD', () => {
      assertStandardCrossRates({
        baseRate: MOCK_GBP_USD_RATES[0],
        tradeRate: MOCK_AUD_USD_RATES[0],
        baseCurrency: 'GBP',
        tradeCurrency: 'AUD',
      });
    });

    it('should correctly get the cross rates of GBP/CAD', () => {
      assertTradeInverseCrossRates({
        baseRate: MOCK_GBP_USD_RATES[0],
        tradeRate: MOCK_USD_CAD_RATES[0],
        baseCurrency: 'GBP',
        tradeCurrency: 'CAD',
      });
    });

    it('should correctly get the cross rates of GBP/JPY', () => {
      assertTradeInverseCrossRates({
        baseRate: MOCK_GBP_USD_RATES[0],
        tradeRate: MOCK_USD_JPY_RATES[0],
        baseCurrency: 'GBP',
        tradeCurrency: 'JPY',
      });
    });

    it('should correctly get the cross rates of GBP/EUR', () => {
      assertStandardCrossRates({
        baseRate: MOCK_GBP_USD_RATES[0],
        tradeRate: MOCK_EUR_USD_RATES[0],
        baseCurrency: 'GBP',
        tradeCurrency: 'EUR',
      });
    });
  });
});
