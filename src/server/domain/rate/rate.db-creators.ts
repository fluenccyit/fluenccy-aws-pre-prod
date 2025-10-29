import { dbService, errorService } from '@server/common';
import { RateDbo, RateModel } from '@server/rate';

class RateDbCreators {
  async createRate(rate: RateDbo | RateModel) {
    try {
      await dbService.table('rate').insert(rate).onConflict(['date', 'baseCurrency', 'tradeCurrency']).merge();
    } catch (error) {
      throw errorService.handleDbError('createRate', error);
    }
  }
}

export const rateDbCreators = new RateDbCreators();
