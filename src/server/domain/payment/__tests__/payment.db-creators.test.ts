import { ApolloError } from 'apollo-server-express';
import { testService } from '@test/server';
import { ERROR_MESSAGE } from '@server/common';
import { paymentDbCreators } from '@server/payment';
import { MOCK_PAYMENT_DBO } from './payment.mocks';

describe('@server/payment | paymentDbCreators', () => {
  beforeEach(() => testService.setupMockDb());
  afterEach(() => testService.tearDownMockDb());

  describe('#createPayment', () => {
    const { createPayment } = paymentDbCreators;

    it('should insert entry into the correct table', async (done) => {
      const dbTracker = testService.getDbTracker();

      dbTracker.on('query', ({ sql }) => {
        expect(sql).toContain('insert into "payment"');
        done();
      });

      createPayment(MOCK_PAYMENT_DBO);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(createPayment(MOCK_PAYMENT_DBO)).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });
});
