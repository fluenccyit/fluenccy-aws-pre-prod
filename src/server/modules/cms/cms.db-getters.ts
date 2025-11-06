import { dbService, errorService } from '@server/common';
import { isArray, map } from 'lodash';
import moment from "moment";
import { ForwardPointDbo, rateDbGetters, RateDbo, rateService } from '@server/rate';
import Knex from 'knex';

class CmsEntriesDbGetters {
  async getEntries(orgId: string, currencyCode: string, type: string = 'unmanaged') {
    try {
      
      const qry = dbService.table('crm_entries')
        .select()
        .where({orgId, currencyCode});
      if (type === 'unmanaged') {
        qry.where('isManaged', false);
      }
      if (type === 'managed') {
        qry.where('isManaged', true);
      }
      qry.orderBy('month', 'asc');
      qry.orderBy('year', 'asc');
      
      const entries = await qry;

      if (!entries) {
        return [];
      }

      // if( type == 'managed' ) {
        for( let i = 0; i < entries.length; i++ ) {
          const entry = entries[i];
  
          var bQuery = dbService.table('crm_feedback').select().where({ 'crm_entry_id': entry.id }).whereNot({'reservedRate': null});
          const feedbacks = await bQuery;
  
          entries[i].feedbacks = feedbacks;
        }
      // }
        // console.log("===entries===", entries)
      return entries.filter(entry => {
        return moment(`${entry.month}-${entry.year}`).endOf('month').diff(moment(), 'minutes') >= 0;
      });
      
    } catch (error) {
      throw errorService.handleDbError('getEntries', error);
    }
  }
  
  async getFeedbacks(orgId: string, isPricing = false) {
    try {
      const entries = await dbService.table('crm_feedback')
        .leftJoin('crm_entries', 'crm_feedback.crm_entry_id', 'crm_entries.id')
        .select("crm_feedback.*")
        .select("crm_entries.month", "crm_entries.year", "crm_entries.currencyCode", "crm_entries.currentRate")
        .where({orgId})
        .where({'reservedDate': null})
        .orderBy('crm_feedback.updated_at', 'asc');
      return entries.filter(entry => {
        return moment(`${entry.month}-${entry.year}`).endOf('month').diff(moment(), 'days') >= 0;
      });
      
    } catch (error) {
      throw errorService.handleDbError('getFeedbacks', error);
    }
  }
  
  async getTransactions(orgId: string) {
    try {
      const qry = dbService.table('crm_feedback').leftJoin('crm_entries', 'crm_feedback.crm_entry_id', 'crm_entries.id')
        .select("crm_feedback.*")
        .select("crm_entries.month", "crm_entries.year", "crm_entries.currencyCode", "crm_entries.currentRate")
        .where({'crm_feedback.orgId': orgId})
        .whereNot({'reservedDate': null})
        .orderBy('crm_feedback.updated_at', 'asc')
      const entries = await qry;

      if (!entries) {
        return null;
      }

      return entries;
      
    } catch (error) {
      console.log('error: ', error)
      throw errorService.handleDbError('getFeedbacks', error);
    }
  }

  async getArchives(orgId: string) {
    try {
      const qry = dbService.table('crm_entries').leftOuterJoin('crm_feedback', 'crm_feedback.crm_entry_id', 'crm_entries.id')
        .select("crm_entries.*")
        .select("crm_feedback.reservedAmount as executedAmount", "crm_feedback.reservedRate as executedRate", "crm_feedback.reservedDate as executedDate")
        .where({'crm_entries.orgId': orgId})
        .orderBy('crm_entries.year', 'asc')
        .orderBy('crm_entries.month', 'asc');
      const entries = await qry;

      if (!entries) {
        return null;
      }

      return entries.filter(entry => {
        return moment(`${entry.month}-${entry.year}`, 'MMM-YYYY').endOf('month').diff(moment(), 'minutes') < 0;
      });
      
    } catch (error) {
      console.log('error: ', error)
      throw errorService.handleDbError('getFeedbacks', error);
    }
  }

  async queryForwardPointFor(years: string[], months: string[], baseCurrencies: string | string[], tradeCurrency: string | string[]) {
    try {
      let query = dbService
        .table('forward_point')
        .select()
        .whereIn('year', years)
        .whereIn('month', months)
        // .where({baseCurrency});
      if (isArray(tradeCurrency)) {
        query.whereIn('tradeCurrency', tradeCurrency);
      } else {
        query.where({tradeCurrency});
      }

      if (isArray(baseCurrencies)) {
        query.whereIn('baseCurrency', baseCurrencies);
      } else {
        query.where({baseCurrency: baseCurrencies});
      }
      const forwardPointDbos: ForwardPointDbo[] = await query;
      return map(forwardPointDbos, rateService.convertForwardPointDboToModel);
    } catch (error) {
      throw errorService.handleDbError('queryForwardPointBetweenDates', error);
    }
  }
  
  async getRates(dateFrom: Date, dateTo: Date, baseCurrency: string) {
    try {
      const rateDbos: RateDbo[] = await dbService
        .table('rate')
        .select()
        .where('date', '>=', dateFrom)
        .where('date', '<=', dateTo)
        .where({baseCurrency})
        .orderBy('date', 'desc');
      return map(rateDbos, rateService.convertRateDboToModel);
    } catch (error) {
      throw errorService.handleDbError('getRates', error);
    }
  }

  async getAvgFeedbackRateByDate(orgId:string) {
    try {
      return await dbService
        .table('crm_feedback')
        .leftJoin('crm_entries', 'crm_feedback.crm_entry_id', 'crm_entries.id')
        .select("crm_feedback.*")
        .select("crm_entries.month")
        .select('crm_entries.year')
        .select('crm_entries.currencyCode')
        .select('crm_entries.id as entryId')
        .where({'crm_feedback.orgId': orgId})
    } catch (error) {
      console.log(error)
      throw errorService.handleDbError('getAvgFeedbackRateByDate', error);
    }
  }

  async getEntryCount(orgId: string, mode:string) {
    try {
      const entries = await dbService.table('crm_entries')
        .select()
        .where({orgId, mode});
      return entries.reduce((acc, entry) => {
        if (moment(`${entry.month}-${entry.year}`).endOf('month').diff(moment(), 'minutes') >= 0) {
          acc[entry.currencyCode] = (acc[entry.currencyCode] || 0) + 1;
        }
        return acc;
      }, {});
    } catch (error) {
      console.log(error)
      throw errorService.handleDbError('getAvgFeedbackRateByDate', error);
    }
  }
}

export const entriesDbGetters = new CmsEntriesDbGetters();
