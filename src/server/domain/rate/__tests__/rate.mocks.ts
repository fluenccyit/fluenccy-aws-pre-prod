import { RateDbo, RateModel } from '@server/rate';
import { sharedDateTimeService } from '@shared/common';
import { DATE_TIME_FORMAT, dateService } from '@server/common';

export const MOCK_RATE_DBOS: RateDbo[] = [
  {
    date: '2021-02-03',
    baseCurrency: 'NZD',
    tradeCurrency: 'USD',
    open: '0.6665',
    high: '0.6746',
    low: '0.6639',
    last: '0.672',
  },
];

export const MOCK_RATE_MODELS: RateModel[] = [
  {
    date: dateService.parseDate('2021-02-03', DATE_TIME_FORMAT.postgresDate),
    baseCurrency: 'NZD',
    tradeCurrency: 'USD',
    open: 0.6665,
    high: 0.6746,
    low: 0.6639,
    last: 0.672,
  },
];

export const MOCK_AUD_USD_RATES: RateModel[] = [
  {
    date: sharedDateTimeService.getDateFromDaysAgo(1),
    baseCurrency: 'AUD',
    tradeCurrency: 'USD',
    open: 0.7128,
    high: 0.7167,
    low: 0.7105,
    last: 0.7138,
  },
];

export const MOCK_EUR_USD_RATES: RateModel[] = [
  {
    date: sharedDateTimeService.getDateFromDaysAgo(1),
    baseCurrency: 'EUR',
    tradeCurrency: 'USD',
    open: 1.093,
    high: 1.0962,
    low: 1.0856,
    last: 1.0871,
  },
];

export const MOCK_GBP_USD_RATES: RateModel[] = [
  {
    date: sharedDateTimeService.getDateFromDaysAgo(1),
    baseCurrency: 'GBP',
    tradeCurrency: 'USD',
    open: 1.3868,
    high: 1.3946,
    low: 1.3833,
    last: 1.3915,
  },
];

export const MOCK_NZD_USD_RATES: RateModel[] = [
  {
    date: sharedDateTimeService.getDateFromDaysAgo(1),
    baseCurrency: 'NZD',
    tradeCurrency: 'USD',
    open: 0.6625,
    high: 0.6648,
    low: 0.6564,
    last: 0.6588,
  },
];

export const MOCK_USD_JPY_RATES: RateModel[] = [
  {
    date: sharedDateTimeService.getDateFromDaysAgo(1),
    baseCurrency: 'USD',
    tradeCurrency: 'JPY',
    open: 113.84,
    high: 113.98,
    low: 112.62,
    last: 112.66,
  },
];

export const MOCK_USD_CAD_RATES: RateModel[] = [
  {
    date: sharedDateTimeService.getDateFromDaysAgo(1),
    baseCurrency: 'USD',
    tradeCurrency: 'CAD',
    open: 1.3509,
    high: 1.3587,
    low: 1.3479,
    last: 1.3538,
  },
];
