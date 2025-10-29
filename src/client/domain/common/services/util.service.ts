import numeral from 'numeral';
import { find, join, replace, some, split, startCase, toLower, trim } from 'lodash';
import { CurrencyType } from '@shared/rate';

const VALID_EMAIL_TESTER = /^[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

class UtilService {
  getUrlSearchParamByKey = (key: string) => new URLSearchParams(window.location.search).get(key);

  convertUrlToSentence = (url: string) => startCase(toLower(replace(replace(url, '/', ' '), '-', ' ')));

  formatCurrencyAmount = (amount: number, currency?: CurrencyType | null) => {
    const formattedAmount = Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);

    if (currency === 'NZD') {
      return replace(formattedAmount, 'NZ', '');
    }

    if (currency === 'AUD') {
      return replace(formattedAmount, 'A', '');
    }

    return formattedAmount;
  };

  formatAmount = (amount: number) => {
    const formattedAmount = Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    return replace(formattedAmount, '$', '');
  };

  formatRateAmount = (amount: number, currency?: CurrencyType | null) => {
    const result = numeral(amount);

    if (!currency || currency !== 'JPY') {
      return `${result.format('0.0000')}`;
    } else {
      return `${result.format('0.00')}`;
    }
  };

  formatCurrencyRateAmount = (amount: number, currency?: CurrencyType | null) => {
    const formattedAmount = Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).formatToParts(amount);

    let { value: currencySymbol } = find(formattedAmount, ({ type }) => type === 'currency') || { value: '$' };

    if (currency === 'NZD') {
      currencySymbol = replace(currencySymbol, 'NZ', '');
    }

    if (currency === 'AUD') {
      currencySymbol = replace(currencySymbol, 'A', '');
    }

    return `${currencySymbol}${this.formatRateAmount(amount, currency)}`;
  };

  isValidEmail = (email: string) => {
    const emailParts = split(email, '@');
    const [account, address] = emailParts;

    if (
      emailParts.length !== 2 ||
      account.length > 64 ||
      address.length > 255 ||
      some(split(address, '.'), (part) => part.length > 63) ||
      !VALID_EMAIL_TESTER.test(email)
    ) {
      return false;
    }

    return true;
  };

  toHyphenCase = (value: string) => toLower(join(split(trim(replace(value, /\s\s+/g, ' ')), ' '), '-'));
}

export const utilService = new UtilService();
