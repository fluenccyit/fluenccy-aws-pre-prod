import { dbService, errorService } from '@server/common';
import { sharedUtilService } from '@shared/common/services/shared-util.service';
import { FinancialProductDbo } from './financial-products.model';

import { isArray } from 'lodash';

class FinancialProductDbCreators {
  async createFinancialProduct(financialProduct: FinancialProductDbo) {
    try {
        await dbService.table('financial_products').insert({
          ...financialProduct,
          id: financialProduct.id || sharedUtilService.generateUid()
        });
    } catch (error) {
        console.log('error ', error)
        throw errorService.handleDbError('createFinancialProduct', error);
    }
  }
}

export const financialProductsDbCreator = new FinancialProductDbCreators();
