import { ApolloError } from 'apollo-server-express';
import { testService } from '@test/server';
import { ERROR_MESSAGE } from '@server/common';
import { rateDbGetters } from '@server/rate';
import { MOCK_RATE_DBOS, MOCK_RATE_MODELS } from './rate.mocks';

describe('@server/rate | rateDbGetters', () => {
  beforeEach(() => testService.setupMockDb());
  afterEach(() => testService.tearDownMockDb());

  describe('#queryRate', () => {
    const { queryRate } = rateDbGetters;

    it('should fetch rates from the database', async () => {
      testService.setDbResponse(MOCK_RATE_DBOS);

      expect(await queryRate()).toEqual(MOCK_RATE_MODELS);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(queryRate()).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });
});
