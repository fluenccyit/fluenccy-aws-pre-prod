import { errorService, dbService } from '@server/common';
import { PaymentDbo } from '@server/payment';

class PaymentDbUpdater {
  async updatePayment({ paymentId, ...paymentToUpdate }: PaymentDbo) {
    try {
      await dbService.table('payment').where({ paymentId }).update(paymentToUpdate);
    } catch (error) {
      throw errorService.handleDbError('updatePayment', error);
    }
  }
}

export const paymentDbUpdaters = new PaymentDbUpdater();
