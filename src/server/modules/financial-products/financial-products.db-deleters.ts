import { dbService, errorService } from '@server/common';

class FinancialProductsDbDeleters {
  async deleteFinancialProductById(orgId: string) {
    try {
      await dbService.table('financial_products').where({ orgId }).delete();
    } catch (error) {
      throw errorService.handleDbError('deleteFinancialProductById', error);
    }
  }
}

export const financialProductsDbDeleter = new FinancialProductsDbDeleters();
