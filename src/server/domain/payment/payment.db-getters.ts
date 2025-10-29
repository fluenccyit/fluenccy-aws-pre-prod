import { filter, includes, map } from 'lodash';
import { GqlSupportedCurrency } from '@graphql';
import { SUPPORTED_CURRENCIES } from '@shared/rate';
import { dbService, errorService } from '@server/common';
import { PaymentDbo, paymentService } from '@server/payment';
import { XeroPaymentStatus, XeroPaymentType } from '@server/xero';

type QueryPaymentParam = {
  tenantId: string;
  paymentStatus: XeroPaymentStatus;
  paymentType: XeroPaymentType;
  currencyCode: GqlSupportedCurrency;
  dateFrom: Date;
  dateTo: Date;
};

type GetPaymentByIdParam = {
  paymentId: string;
  tenantId: string;
};

class PaymentDbGetters {
  async queryPayment({ tenantId, paymentStatus, paymentType, currencyCode, dateFrom, dateTo }: QueryPaymentParam) {
    try {
      const paymentDbos: PaymentDbo[] = await dbService
        .table('payment')
        .select()
        .where({ tenantId, paymentStatus, paymentType, currencyCode })
        .where('date', '>=', dateFrom)
        .where('date', '<=', dateTo)
        .orderBy('date', 'desc');

      return map(paymentDbos, paymentService.convertDboToModel);
    } catch (error) {
      throw errorService.handleDbError('queryPayment', error);
    }
  }

  async queryDistinctCurrenciesByTenantId(tenantId: string, paymentType: string = 'ACCPAYPAYMENT') {
    try {
      // First we check that there are payments against the tenantId, otherwise, `distinct` will throw an error.
      const query = dbService.table('payment').select().where({ tenantId });
      if(paymentType) {
        query.where({ paymentType });
      }
      const paymentDbos: PaymentDbo[] = await query;

      if (!paymentDbos.length) {
        return [];
      }

      const currenciesQuery = dbService.distinctFrom('payment').where({ tenantId });
      if (paymentType) {
        currenciesQuery.where({paymentType});
      }

      const currencies: GqlSupportedCurrency[] = await currenciesQuery.pluck('currencyCode');

      return filter(currencies, (currency) => includes(SUPPORTED_CURRENCIES, currency));
    } catch (error) {
      throw errorService.handleDbError('queryDistinctCurrenciesByTenantId', error);
    }
  }

  async getPaymentById({ paymentId, tenantId }: GetPaymentByIdParam) {
    try {
      const [paymentDbo]: PaymentDbo[] = await dbService.table('payment').select().where({ tenantId, paymentId });

      if (!paymentDbo) {
        return null;
      }

      return paymentService.convertDboToModel(paymentDbo);
    } catch (error) {
      throw errorService.handleDbError('getPaymentByPaymentId', error);
    }
  }
}

export const paymentDbGetters = new PaymentDbGetters();
