import { GqlSupportedCurrency } from '@graphql';
import { ERROR_MESSAGE, loggerService, utilService } from '@server/common';
import { PaymentModel, paymentDbGetters, paymentDbDeleters } from '@server/payment';

type QueryPaymentParam = {
  tenantId: string;
  currency: GqlSupportedCurrency;
  dateFrom: Date;
  dateTo: Date;
  mode: String | null;
};

type GetPaymentByIdParam = {
  paymentId: string;
  tenantId: string;
};

const resource = 'PaymentResource';
class PaymentResource {
  async queryPayment({ tenantId, currency, dateFrom, dateTo, mode }: QueryPaymentParam): Promise<PaymentModel[]> {
    return await paymentDbGetters.queryPayment({
      tenantId,
      dateFrom,
      dateTo,
      paymentStatus: 'AUTHORISED',
      paymentType: mode ? 'ACCRECPAYMENT' : 'ACCPAYPAYMENT',
      currencyCode: currency,
    });
  }

  async getPaymentById({ paymentId, tenantId }: GetPaymentByIdParam, allowNull?: false): Promise<PaymentModel>;
  async getPaymentById({ paymentId, tenantId }: GetPaymentByIdParam, allowNull: true): Promise<PaymentModel | null>;
  async getPaymentById({ paymentId, tenantId }: GetPaymentByIdParam, allowNull = false) {
    loggerService.info('Getting payment by id.', { resource, method: 'getPaymentById', paymentId, tenantId });

    const payment = await paymentDbGetters.getPaymentById({ paymentId, tenantId });

    if (!payment) {
      return utilService.handleAllowNull({ allowNull, error: ERROR_MESSAGE.noPayment });
    }

    return payment;
  }

  async deletePaymentsByTenantId(tenantId: string) {
    const logParam = { resource, method: 'deletePaymentsByTenantId', tenantId };

    loggerService.info('Deleting payments by tenant id from database.', logParam);

    await paymentDbDeleters.deletePaymentsByTenantId(tenantId);
  }
}

export const paymentResource = new PaymentResource();
