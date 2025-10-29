import { GqlSupportedCurrency } from '@graphql';

export type CurrencyType = GqlSupportedCurrency | string;
export const SUPPORTED_CURRENCIES: GqlSupportedCurrency[] = ['AUD','CAD','CNY','EUR','GBP','JPY','NZD','USD'];
// ['AUD','CAD','EUR','GBP','JPY','NZD','USD','AED','ARS',
//                                                              'BDT','BGN','BWP','CHF','CLP','CNY','CRC','CZK','DKK',
//                                                              'EGP','GEL','GHS','HKD','HRK','HUF','IDR','ILS','INR',
//                                                              'KES','KRW','LKR','MAD','MXN','MYR','NGN','NOK','NPR',
//                                                              'PEN','PHP','PKR','PLN','RON','RUB','SEK','SGD','THB',
//                                                              'TRY','TZS','UAH','UGX','UYU','VND','CFA','ZAR','ZMW'];
