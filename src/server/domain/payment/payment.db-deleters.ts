import { dbService, errorService } from '@server/common';

class PaymentDbDeleters {
  async deletePaymentByPaymentId(paymentId: string) {
    try {
      await dbService.table('payment').where({ paymentId }).delete();
    } catch (error) {
      throw errorService.handleDbError('deletePaymentByPaymentId', error);
    }
  }

  async deletePaymentsByTenantId(tenantId: string) {
    try {
      await dbService.table('payment').where({ tenantId }).delete();
    } catch (error) {
      throw errorService.handleDbError('deletePaymentsByTenantId', error);
    }
  }
}

export const paymentDbDeleters = new PaymentDbDeleters();
