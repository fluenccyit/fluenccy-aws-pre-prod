import fetch from 'cross-fetch';
import { map, split } from 'lodash';
import { URLSearchParams } from 'url';
import { format, isValid, parseISO } from 'date-fns';
import { GqlSupportedCurrency } from '@graphql';
import { CurrencyPair, rateDbGetters, RateModel, rateService } from '@server/rate';
import { dateService, DATE_TIME_FORMAT, ERROR_MESSAGE, loggerService } from '@server/common';

type QueryRateParam = {
  baseCurrency: GqlSupportedCurrency;
  tradeCurrency: GqlSupportedCurrency;
};

type QueryRateFromDateParam = QueryRateParam & {
  dateFrom: Date;
};

type QueryRateBetweenDatesParam = QueryRateFromDateParam & {
  dateTo: Date;
};

type FetchRateFeedParam = {
  dateFrom: Date;
  currencyPair: CurrencyPair;
};

type OhlcResponse = {
  start_date: Date;
  end_date: Date;
  price: {
    [date: string]: {
      [currency: string]: {
        open: number;
        high: number;
        low: number;
        close: number;
      };
    };
  };
};

type OhlcErrorResponse = {
  error: {
    code: string,
    info: string
  };
};

const { FX_MARKET_API_KEY } = process.env;

const resource = 'RateResource';
class RateResource {
  async queryRate({ baseCurrency, tradeCurrency }: QueryRateParam) {
    loggerService.info('Query rates.', { resource, method: 'queryRate', baseCurrency, tradeCurrency });

    const rates = await rateDbGetters.queryRate();

    return rateService.getRatesByCurrencyPair({ rates, baseCurrency, tradeCurrency });
  }

  async queryRateFromDate({ dateFrom, baseCurrency, tradeCurrency }: QueryRateFromDateParam) {
    loggerService.info('Query rates from date.', {
      resource,
      baseCurrency,
      tradeCurrency,
      method: 'queryRateFromDate',
      dateFrom: format(dateFrom, DATE_TIME_FORMAT.logDate),
    });

    const rates = await rateDbGetters.queryRateFromDate({ dateFrom });

    return rateService.getRatesByCurrencyPair({ rates, baseCurrency, tradeCurrency });
  }

  async queryRateBetweenDates({ dateFrom, dateTo, baseCurrency, tradeCurrency }: QueryRateBetweenDatesParam) {
    // loggerService.info('Query rates between dates.', {
    //   resource,
    //   baseCurrency,
    //   tradeCurrency,
    //   method: 'queryRateBetweenDates',
    //   dateFrom: ""+dateFrom,//format(dateFrom, DATE_TIME_FORMAT.logDate),
    //   dateTo: ""+dateTo//format(dateTo, DATE_TIME_FORMAT.logDate),
    //   // dateFrom: format(dateFrom, DATE_TIME_FORMAT.logDate),
    //   // dateTo: format(dateTo, DATE_TIME_FORMAT.logDate),
    // });
    
    const rates = await rateDbGetters.queryRateBetweenDates({ dateFrom, dateTo });

    return rateService.getRatesByCurrencyPair({ rates, baseCurrency, tradeCurrency });
  }

  async queryForwardPoint({ baseCurrency, tradeCurrency }: QueryRateParam) {
    loggerService.info('Query forward points.', { resource, method: 'queryForwardRate', baseCurrency, tradeCurrency });

    const [rates, forwardPoints] = await Promise.all([rateDbGetters.queryRate(), rateDbGetters.queryForwardPoint()]);

    return rateService.getForwardPointsByCurrencyPair({ rates, forwardPoints, baseCurrency, tradeCurrency });
  }

  async queryForwardPointFromDate({ dateFrom, baseCurrency, tradeCurrency }: QueryRateFromDateParam) {
    loggerService.info('Query forward points from date.', {
      resource,
      baseCurrency,
      tradeCurrency,
      method: 'queryForwardPointFromDate',
      dateFrom: format(dateFrom, DATE_TIME_FORMAT.logDate),
    });

    const [rates, forwardPoints] = await Promise.all([
      rateDbGetters.queryRateFromDate({ dateFrom }),
      rateDbGetters.queryForwardPointFromDate({ dateFrom }),
    ]);

    return rateService.getForwardPointsByCurrencyPair({ rates, forwardPoints, baseCurrency, tradeCurrency });
  }

  async queryForwardPointBetweenDates({ dateFrom, dateTo, baseCurrency, tradeCurrency }: QueryRateBetweenDatesParam) {
    loggerService.info('Query forward rates between dates.', {
      method: 'queryForwardPointsBetweenDates',
      resource,
      baseCurrency,
      tradeCurrency,
      dateFrom: format(dateFrom, DATE_TIME_FORMAT.logDate),
      dateTo: format(dateTo, DATE_TIME_FORMAT.logDate),
    });

    const [rates, forwardPoints] = await Promise.all([
      rateDbGetters.queryRateBetweenDates({ dateFrom, dateTo }),
      rateDbGetters.queryForwardPointBetweenDates({ dateFrom, dateTo }),
    ]);

    return rateService.getForwardPointsByCurrencyPair({ rates, forwardPoints, baseCurrency, tradeCurrency });
  }

  fetchRateFeed = async ({ dateFrom, currencyPair }: FetchRateFeedParam): Promise<RateModel[]> => {
      if (!isValid(dateFrom)) {
        throw new Error(ERROR_MESSAGE.invalidDate);
      }
      //loggerService.info('101 -----> In fetchRateFeed currencyPair > '+ currencyPair);
      const [baseCurrency, tradeCurrency] = split(currencyPair, '/') as GqlSupportedCurrency[];
      //loggerService.info('102 -----> In fetchRateFeed baseCurrency > '+ baseCurrency + ' tradeCurrency '+ tradeCurrency);
      const ohlcCurrency = `${baseCurrency}${tradeCurrency}`;
      
      //Please note, as per fxmarketapi documentation fetchToDate should not be a weekend date
      let fetchToDate = new Date();
      //If fetchFromDate is Sunday then, subtract two more days
      if(fetchToDate.getDay() == 0){
        fetchToDate = new Date(new Date().setDate(new Date().getDate() - 2));
      } else if(fetchToDate.getDay() == 6){//If fetchFromDate is Sunday then, subtract one more day
        fetchToDate = new Date(new Date().setDate(new Date().getDate() - 1));
      }

      console.log("From date before checking weekend", dateFrom);

      
      if(dateFrom.getDay() == 0 ) {
        console.log("It is sunday >> in if")
        dateFrom = new Date(new Date(dateFrom).setDate(dateFrom.getDate() + 1));
      } else if (dateFrom.getDay() == 6 ) {
        console.log("It is saturdday >> in else if")
        dateFrom = new Date(new Date(dateFrom).setDate(dateFrom.getDate() + 2));
      }

      console.log("from date >> ", dateFrom);
      // loggerService.info('103 -----> In fetchRateFeed start_date > '+ format(dateFrom, DATE_TIME_FORMAT.fxMarketApiDate));
      // loggerService.info('104 -----> In fetchRateFeed end_date > '+ format(fetchToDate, DATE_TIME_FORMAT.fxMarketApiDate));
      
      const searchParams = new URLSearchParams({
        currency: ohlcCurrency,
        api_key: FX_MARKET_API_KEY,
        start_date: format(dateFrom, DATE_TIME_FORMAT.fxMarketApiDate),
        end_date: format(fetchToDate, DATE_TIME_FORMAT.fxMarketApiDate),
        interval: 'daily',
      });

      console.log("searchParams", searchParams);
      loggerService.info(searchParams.toString());
      
      // console.log('fx api request ', `https://fxmarketapi.com/apitimeseries?${searchParams.toString()}`);
      // loggerService.info(`https://fxmarketapi.com/apitimeseries?${searchParams.toString()}`);

      var url = `https://fxmarketapi.com/apitimeseries?${searchParams.toString()}`;

      // var url = `https://fxmarketapi.com/apitimeseries?currency=${ohlcCurrency}&api_key=${FX_MARKET_API_KEY}&start_date=${format(dateFrom, DATE_TIME_FORMAT.fxMarketApiDate)}&end_date=${format(fetchToDate, DATE_TIME_FORMAT.fxMarketApiDate)}&interval=daily`;

      console.log('fx api request ', url);
      loggerService.info(url);
      
      // const response = await fetch(`https://fxmarketapi.com/apitimeseries?${searchParams.toString()}`);
      const response = await fetch(url);
      let strResponse = await response.text();
      strResponse = strResponse.replace(/\bNaN\b/g, "0");
     
      const ohlcRates: OhlcResponse = await JSON.parse(strResponse);
      
      //Following block is log error response from fxmarket api
      if(!ohlcRates.price){
        try {
          loggerService.error('Error occured while fetch details, error info: '+ JSON.stringify(ohlcRates));
        } catch (error) {
          console.error('error >> ', error)
        }
      }
     
      return map(ohlcRates.price, (ohlcRate, dateString) => ({
        date: dateService.parseDate(dateString, DATE_TIME_FORMAT.fxMarketApiDate),
        baseCurrency,
        tradeCurrency,
        open: ohlcRate[ohlcCurrency].open,
        high: ohlcRate[ohlcCurrency].high,
        low: ohlcRate[ohlcCurrency].low,
        last: ohlcRate[ohlcCurrency].close,
      }));
  };

  // Helper method to safely format dates
  private formatDateSafely(date: Date | string | null | undefined): string | null {
    if (!date) {
      return null;
    }

    try {
      let dateObj: Date;
      
      if (typeof date === 'string') {
        dateObj = parseISO(date);
      } else if (date instanceof Date) {
        dateObj = date;
      } else {
        console.warn('Invalid date type:', typeof date, date);
        return null;
      }

      // Check if date is valid before formatting
      if (!isValid(dateObj)) {
        console.warn('Invalid date value:', date);
        return null;
      }

      return format(dateObj, 'yyyy-MM-dd HH:mm:ss');
    } catch (error) {
      console.error('Error formatting date:', error.message, 'Input:', date);
      return null;
    }
  }

  async queryForwardPointBetweenDates({ 
    baseCurrency, 
    tradeCurrency, 
    dateFrom, 
    dateTo 
  }: { 
    baseCurrency: string; 
    tradeCurrency: string; 
    dateFrom?: Date | string; 
    dateTo?: Date | string; 
  }) {
    try {
      console.log('queryForwardPointBetweenDates called with:', {
        baseCurrency,
        tradeCurrency,
        dateFrom,
        dateTo,
        dateFromType: typeof dateFrom,
        dateToType: typeof dateTo
      });

      // Validate and format dates safely
      const formattedDateFrom = this.formatDateSafely(dateFrom);
      const formattedDateTo = this.formatDateSafely(dateTo);

      console.log('Formatted dates:', {
        formattedDateFrom,
        formattedDateTo
      });

      // Call database layer with validated dates
      return await rateDbGetters.queryForwardPointFromDate({
        baseCurrency,
        tradeCurrency,
        dateFrom: formattedDateFrom,
        dateTo: formattedDateTo,
      });
    } catch (error) {
      console.error('Error in queryForwardPointBetweenDates:', error);
      throw error;
    }
  }

  // Similar fix for other methods that use date formatting
  async queryRateFromDate({ 
    baseCurrency, 
    tradeCurrency, 
    dateFrom, 
    dateTo 
  }: { 
    baseCurrency: string; 
    tradeCurrency: string; 
    dateFrom?: Date | string; 
    dateTo?: Date | string; 
  }) {
    try {
      console.log('queryRateFromDate called with:', {
        baseCurrency,
        tradeCurrency,
        dateFrom,
        dateTo,
        dateFromType: typeof dateFrom,
        dateToType: typeof dateTo
      });

      // Validate and format dates safely
      const formattedDateFrom = this.formatDateSafely(dateFrom);
      const formattedDateTo = this.formatDateSafely(dateTo);

      console.log('Formatted dates for rates:', {
        formattedDateFrom,
        formattedDateTo
      });

      // If no dates provided, fall back to basic currency pair query
      if (!formattedDateFrom && !formattedDateTo) {
        console.log('No date filters, querying by currency pair only');
        return await rateDbGetters.queryRateByCurrencyPair(`${baseCurrency}/${tradeCurrency}`);
      }

      // Call database layer with date filtering
      return await rateDbGetters.queryRateFromDate({
        baseCurrency,
        tradeCurrency,
        dateFrom: formattedDateFrom,
        dateTo: formattedDateTo,
      });
    } catch (error) {
      console.error('Error in queryRateFromDate:', error);
      throw error;
    }
  }
}

export const rateResource = new RateResource();
