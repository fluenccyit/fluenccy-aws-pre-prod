import { map, split } from 'lodash';
import { GqlSupportedCurrency } from '@graphql';

export type CurrencyPair = `${GqlSupportedCurrency}/${GqlSupportedCurrency}`;

export const DEFAULT_FETCH_FOR_DAYS: any = 1200;

// export const STORED_CURRENCY_PAIRS: CurrencyPair[] = ['AUD/USD', 'EUR/USD', 'GBP/USD', 'USD/JPY', 'NZD/USD', 'USD/CAD', 'NZD/AUD', 'NZD/EUR', 'NZD/GBP', 'NZD/JPY'];
export const STORED_CURRENCY_PAIRS: CurrencyPair[] = [];

// var baseCurrencies = ['USD','EUR','JPY','GBP','AUD','CAD','CHF','NZD'];
// var tradeCurrencies = ['USD','EUR','JPY','GBP','AUD','CAD','CHF','NZD'];

// var baseCurrencies = ['USD','EUR','JPY','GBP','AUD','CAD','NZD', 'CNY'];
// var tradeCurrencies = ['USD','EUR','JPY','GBP','AUD','CAD','NZD', 'CNY'];

// base currencies based on fwd points
var baseCurrencies = ['USD','EUR','JPY','GBP','AUD','CAD','NZD', 'CNY'];
var tradeCurrencies = ['USD','EUR','JPY','GBP','AUD','CAD','NZD', 'CNY'];

// if ( process.env.ENVIRONMENT != 'local' && process.env.ENVIRONMENT != 'qa') {
//   tradeCurrencies=['AED','ARS','AUD','BDT','BGN','BWP','CAD','CHF','CLP',
//                   'CNY','CRC','CZK','DKK','EGP','EUR','GBP','GEL','GHS',
//                   'HKD','HRK','HUF','IDR','ILS','INR','JPY','KES','KRW',
//                   'LKR','MAD','MXN','MYR','NGN','NOK','NPR','NZD','PEN',
//                   'PHP','PKR','PLN','RON','RUB','SEK','SGD','THB','TRY',
//                   'TZS','UAH','UGX','USD','UYU','VND','CFA','ZAR','ZMW'];
//   baseCurrencies = tradeCurrencies;
// }

for(var i=0;i<baseCurrencies.length;i++)
{
  for(var j=0;j<tradeCurrencies.length;j++)
  {
    if(tradeCurrencies[j]!==baseCurrencies[i])
    {
      STORED_CURRENCY_PAIRS.push(`${baseCurrencies[i]}/${tradeCurrencies[j]}`)
    }
  }
}

export const STORED_CURRENCY_PAIRS_INVERTED = map(STORED_CURRENCY_PAIRS, (currencyPair) => {
  const [base, trade] = split(currencyPair, '/');

  return `${trade as GqlSupportedCurrency}/${base as GqlSupportedCurrency}`;
}) as CurrencyPair[];

export const CURRENCY_PRIORITY = {
  EUR: 1000,
  GBP: 2000,
  AUD: 3000,
  NZD: 4000,
  USD: 5000,
  JPY: 6000,
  CAD: 7000,
  CHF: 8000,
  CNH: 9000,
};
