import { ApolloError } from 'apollo-server-express';
import { testService } from '@test/server';
import { ERROR_MESSAGE } from '@server/common';
import { paymentDbDeleters } from '@server/payment';
import { MOCK_PAYMENT_DBO } from './payment.mocks';

describe('@server/payment | paymentDbDeleters', () => {
  beforeEach(() => testService.setupMockDb());
  afterEach(() => testService.tearDownMockDb());

  describe('#deletePaymentByPaymentId', () => {
    const { deletePaymentByPaymentId } = paymentDbDeleters;

    it('should delete entry from the correct table', async (done) => {
      const dbTracker = testService.getDbTracker();

      dbTracker.on('query', ({ sql }) => {
        expect(sql).toContain('delete from "payment"');
        done();
      });

      deletePaymentByPaymentId(MOCK_PAYMENT_DBO.paymentId);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(deletePaymentByPaymentId(MOCK_PAYMENT_DBO.paymentId)).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });
});
