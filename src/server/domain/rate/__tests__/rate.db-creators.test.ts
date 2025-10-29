import { ApolloError } from 'apollo-server-express';
import { testService } from '@test/server';
import { ERROR_MESSAGE } from '@server/common';
import { rateDbCreators } from '@server/rate';
import { MOCK_RATE_DBOS } from './rate.mocks';

describe('@server/rate | rateDbCreators', () => {
  beforeEach(() => testService.setupMockDb());
  afterEach(() => testService.tearDownMockDb());

  describe('#createRate', () => {
    const { createRate } = rateDbCreators;

    it('should insert entry into the correct table', async (done) => {
      const dbTracker = testService.getDbTracker();

      dbTracker.on('query', ({ sql }) => {
        expect(sql).toContain('insert into "rate"');
        done();
      });

      createRate(MOCK_RATE_DBOS[0]);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(createRate(MOCK_RATE_DBOS[0])).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });
});
