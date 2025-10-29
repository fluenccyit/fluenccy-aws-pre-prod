import { CURRENCY_SCORE_ALLOCATION, sharedCurrencyScoreService } from '@shared/currency-score';

describe('@shared/currency-score | sharedCurrencyScoreService', () => {
  afterEach(() => window.localStorage.clear());

  describe('#getMarginScore', () => {
    const { getMarginScore } = sharedCurrencyScoreService;

    it('should return the maximum allocation if the passed past margin is less than or equal to 0.1%', () => {
      expect(getMarginScore(0.001)).toEqual(CURRENCY_SCORE_ALLOCATION.margin);
      expect(getMarginScore(0.0009)).toEqual(CURRENCY_SCORE_ALLOCATION.margin);
      expect(getMarginScore(0.0005)).toEqual(CURRENCY_SCORE_ALLOCATION.margin);
    });

    it('should return 0 if the passed past margin is greater than 1%', () => {
      expect(getMarginScore(0.01)).toEqual(0);
      expect(getMarginScore(0.02)).toEqual(0);
      expect(getMarginScore(0.1)).toEqual(0);
    });

    it('should return the correct proportion of the margin allocation if the passed past margin is between 0.1% and 1%', () => {
      expect(getMarginScore(0.002)).toEqual(80);
      expect(getMarginScore(0.0036)).toEqual(64);
      expect(getMarginScore(0.0089)).toEqual(11);
    });
  });

  describe('#getGainLossScore', () => {
    const { getGainLossScore } = sharedCurrencyScoreService;

    it('should return 0 if the gain loss margin is less than or equal to -5%', () => {
      expect(getGainLossScore(-0.06)).toEqual(0);
      expect(getGainLossScore(-0.1)).toEqual(0);
    });

    it('should return 15 if the gain loss margin is between -5% and -2%, or greater than 5%', () => {
      expect(getGainLossScore(-0.04)).toEqual(15);
      expect(getGainLossScore(-0.021)).toEqual(15);
      expect(getGainLossScore(0.09)).toEqual(15);
    });

    it('should return 20 if the gain loss margin is between -2% and 0%, or between 2% and 5%', () => {
      expect(getGainLossScore(-0.02)).toEqual(20);
      expect(getGainLossScore(0.021)).toEqual(20);
      expect(getGainLossScore(0.049)).toEqual(20);
    });

    it('should return the maximum allocation if the gain loss margin is between 0% and 2%', () => {
      expect(getGainLossScore(0)).toEqual(CURRENCY_SCORE_ALLOCATION.gainLoss);
      expect(getGainLossScore(0.01)).toEqual(CURRENCY_SCORE_ALLOCATION.gainLoss);
      expect(getGainLossScore(0.019)).toEqual(CURRENCY_SCORE_ALLOCATION.gainLoss);
    });
  });
});
