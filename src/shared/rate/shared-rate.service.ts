import { format, sub } from 'date-fns';
import { forEach, includes, size } from 'lodash';
import { GqlForwardPoint, GqlRate } from '@graphql';
import { SHARED_DATE_TIME_FORMAT } from '@shared/common';
import { CurrencyType, ForwardPointMapByDate, RateMapByDate, SUPPORTED_CURRENCIES } from '@shared/rate';

type GetRateOnDateParam = {
  rateMap: RateMapByDate;
  date: Date;
  count?: number;
};

type GetForwardPointOnDateParam = {
  forwardPointMap: ForwardPointMapByDate;
  date: Date;
  count?: number;
};

class SharedRateService {
  isCurrencySupported = (currency: CurrencyType) => includes(SUPPORTED_CURRENCIES, currency);

  generateRateMap = (rates: GqlRate[]) => {
    const rateMap: RateMapByDate = {};

    forEach(rates, (rate) => {
      rateMap[format(rate.date, SHARED_DATE_TIME_FORMAT.rateMapKey)] = rate;
    });

    return rateMap;
  };

  generateForwardPointMap = (forwardPoints: GqlForwardPoint[]) => {
    const forwardPointMap: ForwardPointMapByDate = {};

    forEach(forwardPoints, (forwardRate) => {
      forwardPointMap[format(forwardRate.date, SHARED_DATE_TIME_FORMAT.forwardPointMapKey)] = forwardRate;
    });

    return forwardPointMap;
  };

  getRateOnDate = ({ rateMap, date, count = 1 }: GetRateOnDateParam): GqlRate => {
    // if (count >= size(rateMap)) {
    //   throw new Error('Unable to find an appropriate rate on the specified date.');
    // }

    let dateForFetching = date;
    var dateKey = format(dateForFetching, SHARED_DATE_TIME_FORMAT.rateMapKey);

    console.log("Getting rate on date", dateKey, "for date", date);

    if( !rateMap[dateKey] ) {
      const sortedKeys = Object.keys(rateMap).sort();
      const lastKey = sortedKeys[sortedKeys.length - 1];
      
      console.log("Date key not found, returning last available:", lastKey);
      return rateMap[lastKey];
    }

    // while( !rateMap[dateKey] ) {
    //   dateForFetching = sub(dateForFetching, { days: 1 });
    //   dateKey = format(dateForFetching, SHARED_DATE_TIME_FORMAT.rateMapKey);
    // }

    // If we don't have the rate on the specified date, then we may be on a weekend, in which case, look for the rate on the previous day.
    // return rateMap[dateKey] || this.getRateOnDate({ rateMap, date: sub(date, { days: 1 }), count: count + 1 });
    return rateMap[dateKey];
  };

  getForwardPointOnDate = ({ forwardPointMap, date, count = 1 }: GetForwardPointOnDateParam): GqlForwardPoint => {
    // if (count >= size(forwardPointMap)) {
    //   throw new Error('Unable to find an appropriate forward rate on the specified date.');
    // }

    if( !Object.keys(forwardPointMap).length ) return {
                                            date: '2025-05-30',
                                            month: 'May',
                                            year: '2025',
                                            baseCurrency: 'USD',
                                            tradeCurrency: 'AUD',
                                            forwardPoints: 0
                                          };

    let dateForFetching = date;

    var dateKey = format(dateForFetching, SHARED_DATE_TIME_FORMAT.forwardPointMapKey);
    console.log("Getting forward point on date", dateKey, "for date", date);

    if( !forwardPointMap[dateKey] ) {
      return {
                date: '2025-05-30',
                month: 'May',
                year: '2025',
                baseCurrency: forwardPointMap['baseCurrency'] || 'USD',
                tradeCurrency: forwardPointMap['tradeCurrency'] || 'AUD',
                forwardPoints: 0
              };
    }

    // while( !forwardPointMap[dateKey] ) {
    //   return {
    //             date: '2025-05-30',
    //             month: 'May',
    //             year: '2025',
    //             baseCurrency: 'USD',
    //             tradeCurrency: 'AUD',
    //             forwardPoints: 0
    //           };
    //   // dateForFetching = sub(dateForFetching, { days: 1 })
    //   // dateKey = format(dateForFetching, SHARED_DATE_TIME_FORMAT.forwardPointMapKey);
    // }

    // If we don't have the rate on the specified date, look for the forward rate on the previous month.
    // return forwardPointMap[dateKey] || this.getForwardPointOnDate({ forwardPointMap, date: sub(date, { months: 1 }), count: count + 1 });
    return forwardPointMap[dateKey];
  };
}

export const sharedRateService = new SharedRateService();
