import { utilService } from '@client/common';

describe('@client/common | utilService', () => {
  describe('#formatCurrencyAmount', () => {
    const { formatCurrencyAmount } = utilService;

    it('should return the correctly formatted amount when passed a USD currency', () => {
      expect(formatCurrencyAmount(123456.78, 'USD')).toEqual('$123,456.78');
    });

    it('should return the correctly formatted amount when passed a EUR currency', () => {
      expect(formatCurrencyAmount(123456.78, 'EUR')).toEqual('€123,456.78');
    });

    it('should return the correctly formatted amount when passed a GBP currency', () => {
      expect(formatCurrencyAmount(123456.78, 'GBP')).toEqual('£123,456.78');
    });

    it('should return the correctly formatted amount when passed a AUD currency', () => {
      expect(formatCurrencyAmount(123456.78, 'AUD')).toEqual('$123,456.78');
    });

    it('should return the correctly formatted amount when passed a NZD currency', () => {
      expect(formatCurrencyAmount(123456.78, 'NZD')).toEqual('$123,456.78');
    });

    it('should return the correctly formatted amount when passed a JPY currency', () => {
      expect(formatCurrencyAmount(123456.78, 'JPY')).toEqual('¥123,457');
    });
  });

  describe('#formatAmount', () => {
    const { formatAmount } = utilService;

    it('should return the correctly formatted amount without a currency symbol', () => {
      expect(formatAmount(123456.78)).toEqual('123,456.78');
    });
  });

  describe('#formatCurrencyRateAmount', () => {
    const { formatCurrencyRateAmount } = utilService;

    it('should return the correctly formatted rate to 4 d.p when not JPY', () => {
      expect(formatCurrencyRateAmount(1.234567, 'USD')).toEqual('$1.2346');
      expect(formatCurrencyRateAmount(1.234567, 'EUR')).toEqual('€1.2346');
      expect(formatCurrencyRateAmount(1.234567, 'GBP')).toEqual('£1.2346');
      expect(formatCurrencyRateAmount(1.234567, 'AUD')).toEqual('$1.2346');
      expect(formatCurrencyRateAmount(1.234567, 'NZD')).toEqual('$1.2346');
    });

    it('should return the correctly formatted rate to 2 d.p when JPY', () => {
      expect(formatCurrencyRateAmount(1.234567, 'JPY')).toEqual('¥1.23');
    });
  });

  describe('#isValidEmail', () => {
    const { isValidEmail } = utilService;

    it('should return false for invalid emails', () => {
      expect(isValidEmail('not.com')).toBeFalsy();
      expect(isValidEmail('not@a@valid.com')).toBeFalsy();
      expect(isValidEmail('not@valid..com')).toBeFalsy();
      expect(isValidEmail('.not@valid.com')).toBeFalsy();
    });

    it('should return true for valid emails', () => {
      expect(isValidEmail('test@domain.com')).toBeTruthy();
      expect(isValidEmail('lastname@domain.com')).toBeTruthy();
      expect(isValidEmail('test.email.with+symbol@domain.com')).toBeTruthy();
      expect(isValidEmail('id-with-dash@domain.com')).toBeTruthy();
      expect(isValidEmail('a@domain.com')).toBeTruthy();
    });
  });

  describe('#toHyphenCase', () => {
    const { toHyphenCase } = utilService;

    it('should return a lower cased hyphen separated string', () => {
      expect(toHyphenCase('This Is A Sentence')).toEqual('this-is-a-sentence');
      expect(toHyphenCase('  This   Is   A   Sentence   ')).toEqual('this-is-a-sentence');
    });
  });
});
