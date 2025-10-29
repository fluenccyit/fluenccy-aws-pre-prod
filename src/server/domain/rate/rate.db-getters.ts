import { map, split } from 'lodash';
import { DATE_TIME_FORMAT, dbService, errorService } from '@server/common';
import { CurrencyPair, ForwardPointDbo, RateDbo, rateService } from '@server/rate';
import { format } from 'date-fns';

type QueryRateFromDateParam = {
  baseCurrency: string;
  tradeCurrency: string;
  dateFrom?: string | null;
  dateTo?: string | null;
};

type QueryRateBetweenDatesParam = {
  dateFrom: Date;
  dateTo: Date;
};

class RateDbGetters {
  async queryRate() {
    try {
      const rateDbos: RateDbo[] = await dbService.table('rate').select().orderBy('date', 'desc');

      return map(rateDbos, rateService.convertRateDboToModel);
    } catch (error) {
      throw errorService.handleDbError('queryRate', error);
    }
  }

  async queryRateByCurrencyPair(currencyPair: CurrencyPair) {
    try {
      const [baseCurrency, tradeCurrency] = split(currencyPair, '/');
      const rateDbos: RateDbo[] = await dbService.table('rate').select().where({ baseCurrency, tradeCurrency }).orderBy('date', 'desc');

      return map(rateDbos, rateService.convertRateDboToModel);
    } catch (error) {
      throw errorService.handleDbError('queryRateByCurrencyPair', error);
    }
  }

  // async queryRateFromDate({ dateFrom }: QueryRateFromDateParam) {
  //   try {
  //     const rateDbos: RateDbo[] = await dbService.table('rate').select().where('date', '>=', dateFrom).orderBy('date', 'desc');

  //     return map(rateDbos, rateService.convertRateDboToModel);
  //   } catch (error) {
  //     throw errorService.handleDbError('queryRateFromDate', error);
  //   }
  // }

  async queryRateBetweenDates({ dateFrom, dateTo }: QueryRateBetweenDatesParam) {
    try {
      // console.log('before executing query dateFrom and',dateFrom, dateTo);
      // console.log('before executing query dateFrom and typeof',typeof dateFrom, typeof dateTo);
      // if(typeof dateFrom === 'string'){
      //   console.log('formatted > if ', DATE_TIME_FORMAT.postgresDate);
      //   console.log('formatted > if 2 ', format(new Date(dateFrom), DATE_TIME_FORMAT.postgresDate));
      //   console.log('formatted > ', format(dateFrom, DATE_TIME_FORMAT.postgresDate))
      //   console.log('formatted > end');
      // } else{
      //   console.log('dateFrom > ', dateFrom)
      // }
      const rateDbos: RateDbo[] = await dbService
        .table('rate')
        .select()
        .where('date', '>=', dateFrom) //typeof dateFrom === 'string'? format(new Date(dateFrom), DATE_TIME_FORMAT.postgresDate):
        .where('date', '<=', dateTo) // typeof dateFrom === 'string'? format(new Date(dateTo), DATE_TIME_FORMAT.postgresDate):
        .orderBy('date', 'desc');
      //console.log('after executing query rateDbos ',rateDbos);
      return map(rateDbos, rateService.convertRateDboToModel);
    } catch (error) {
      throw errorService.handleDbError('queryRateBetweenDates', error);
    }
  }

  async queryForwardPoint() {
    try {
      const forwardPointDbos: ForwardPointDbo[] = await dbService.table('forward_point').select().orderBy('date', 'desc');

      return map(forwardPointDbos, rateService.convertForwardPointDboToModel);
    } catch (error) {
      throw errorService.handleDbError('queryForwardPoint', error);
    }
  }

  async queryForwardPointFromDate({ 
    baseCurrency, 
    tradeCurrency, 
    dateFrom, 
    dateTo 
  }: QueryRateFromDateParam) {
    try {
      if (!baseCurrency || !tradeCurrency) {
        throw new Error('baseCurrency and tradeCurrency are required');
      }

      let query = dbService
        .table('forward_point')
        .select()
        .where({ baseCurrency, tradeCurrency });

      // Apply date filters only if valid dates are provided
      if (dateFrom) {
        query = query.where('date', '>=', dateFrom);
      }

      if (dateTo) {
        query = query.where('date', '<=', dateTo);
      }

      const forwardPointDbos: ForwardPointDbo[] = await query.orderBy('date', 'desc');
      
      console.log(`Found ${forwardPointDbos.length} forward points for ${baseCurrency}/${tradeCurrency}`);
      
      return map(forwardPointDbos, rateService.convertForwardPointDboToModel);
    } catch (error) {
      console.error('Error in queryForwardPointFromDate:', error);
      throw errorService.handleDbError('queryForwardPointFromDate', error);
    }
  }

  async queryForwardPointBetweenDates({ dateFrom, dateTo }: QueryRateBetweenDatesParam) {
    try {
      const forwardPointDbos: ForwardPointDbo[] = await dbService
        .table('forward_point')
        .select()
        .where('date', '>=', dateFrom)
        .where('date', '<=', dateTo)
        .orderBy('date', 'desc');

      return map(forwardPointDbos, rateService.convertForwardPointDboToModel);
    } catch (error) {
      throw errorService.handleDbError('queryForwardPointBetweenDates', error);
    }
  }

  async queryMarketRates(baseCurrency : any, tradeCurrency : any) {
    try {
      const rateDbos: RateDbo[] = await dbService
        .table('rate')
        .select()
        .where({baseCurrency,tradeCurrency})
        .orderBy('date', 'desc')
        .limit(89);
      return map(rateDbos, rateService.convertRateDboToModel);
    } catch (error) {
      throw errorService.handleDbError('queryMarketRates', error);
    }
  }

  async queryRateFromDate({ 
    baseCurrency, 
    tradeCurrency, 
    dateFrom, 
    dateTo 
  }: QueryRateFromDateParam) {
    try {
      if (!baseCurrency || !tradeCurrency) {
        throw new Error('baseCurrency and tradeCurrency are required');
      }

      let query = dbService
        .table('rate')
        .select()
        .where({ baseCurrency, tradeCurrency });

      // Apply date filters only if valid dates are provided
      if (dateFrom) {
        query = query.where('date', '>=', dateFrom);
        console.log('Applied dateFrom filter:', dateFrom);
      }

      if (dateTo) {
        query = query.where('date', '<=', dateTo);
        console.log('Applied dateTo filter:', dateTo);
      }

      const rateDbos: RateDbo[] = await query.orderBy('date', 'desc');
      
      console.log(`Found ${rateDbos.length} rates for ${baseCurrency}/${tradeCurrency} with date filters`);
      
      return map(rateDbos, rateService.convertRateDboToModel);
    } catch (error) {
      console.error('Error in queryRateFromDate:', error);
      throw errorService.handleDbError('queryRateFromDate', error);
    }
  }
}

export const rateDbGetters = new RateDbGetters();
