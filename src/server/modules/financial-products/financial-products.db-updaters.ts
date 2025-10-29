import { dbService, errorService } from '@server/common';
import { FinancialProductDbo } from './financial-products.model';

import { isArray } from 'lodash';

class FinancialProductDbUpdaters{
  async updateFinancialProduct(orgId:string,title:string) {
    try {
        await dbService.table('financial_products').where('orgId',orgId)
        .update('title',title);
   } catch (error) {
        console.log('error ', error)
        throw errorService.handleDbError('updateFinancialProduct', error);
    }
  }
}

export const financialProductsDbUpdater = new FinancialProductDbUpdaters();
