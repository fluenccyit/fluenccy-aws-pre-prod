import { ApolloError } from 'apollo-server-express';
import { testService } from '@test/server';
import { paymentDbUpdaters } from '@server/payment';
import { ERROR_MESSAGE } from '@server/common';
import { MOCK_PAYMENT_DBO } from './payment.mocks';

describe('@server/payment | paymentDbUpdaters', () => {
  beforeEach(() => testService.setupMockDb());
  afterEach(() => testService.tearDownMockDb());

  describe('#updatePayment', () => {
    const { updatePayment } = paymentDbUpdaters;

    it('should update entry in the correct table', async (done) => {
      const dbTracker = testService.getDbTracker();

      dbTracker.on('query', ({ sql }) => {
        expect(sql).toContain('update "payment"');
        done();
      });

      updatePayment(MOCK_PAYMENT_DBO);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(updatePayment(MOCK_PAYMENT_DBO)).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });
});
