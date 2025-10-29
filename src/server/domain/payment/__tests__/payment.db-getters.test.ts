import { ApolloError } from 'apollo-server-express';
import { testService } from '@test/server';
import { ERROR_MESSAGE } from '@server/common';
import { paymentDbGetters } from '@server/payment';
import { MOCK_PAYMENT_DBO, MOCK_PAYMENT_MODEL } from './payment.mocks';

describe('@server/payment | paymentDbGetters', () => {
  beforeEach(() => testService.setupMockDb());
  afterEach(() => testService.tearDownMockDb());

  describe('#queryPayment', () => {
    const { queryPayment } = paymentDbGetters;

    it('should fetch payments from the database', async () => {
      testService.setDbResponse([MOCK_PAYMENT_DBO]);

      expect(
        await queryPayment({
          tenantId: MOCK_PAYMENT_DBO.tenantId,
          paymentStatus: 'AUTHORISED',
          paymentType: 'ACCPAYPAYMENT',
          currencyCode: 'USD',
          dateFrom: new Date(),
          dateTo: new Date(),
        })
      ).toEqual([MOCK_PAYMENT_MODEL]);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(
        queryPayment({
          tenantId: MOCK_PAYMENT_DBO.tenantId,
          paymentStatus: 'AUTHORISED',
          paymentType: 'ACCPAYPAYMENT',
          currencyCode: 'USD',
          dateFrom: new Date(),
          dateTo: new Date(),
        })
      ).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });

  describe('#getPaymentById', () => {
    const { getPaymentById } = paymentDbGetters;
    const { paymentId, tenantId } = MOCK_PAYMENT_DBO;

    it('should fetch the payment from the database matching the payment id', async () => {
      testService.setDbResponse([MOCK_PAYMENT_DBO]);

      expect(await getPaymentById({ paymentId, tenantId })).toEqual(MOCK_PAYMENT_MODEL);
    });

    it('should throw an unknown apollo error if an error occurs', async () => {
      testService.setDbError();

      await expect(getPaymentById({ paymentId, tenantId })).rejects.toThrow(new ApolloError(ERROR_MESSAGE.unknown));
    });
  });
});
