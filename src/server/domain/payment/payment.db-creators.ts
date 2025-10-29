import { dbService, errorService } from '@server/common';
import { PaymentDbo, PaymentModel } from '@server/payment';

class PaymentDbCreators {
  async createPayment(payment: PaymentDbo | PaymentModel) {
    try {
        await dbService.table('payment').insert(payment).onConflict(['tenantId', 'paymentId', 'provider']).merge();
    } catch (error) {
      console.log('error ', error)
      throw errorService.handleDbError('createPayment', error);
    }
  }
}

export const paymentDbCreators = new PaymentDbCreators();
