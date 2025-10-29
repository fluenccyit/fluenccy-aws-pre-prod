import { map } from 'lodash';
import { GqlSupportedCurrency } from '@graphql';
import { dbService, errorService } from '@server/common';
import { InvoiceDbo, invoiceService } from '@server/invoice';
import { XeroInvoiceStatus, XeroInvoiceType } from '@server/xero';
import { FinancialProductDbo } from './financial-products.model';

class FinancialProductsDbGetters {
  async getAllFinancialProducts(mode: string) {
    try {
      const FinancialProductDbos: FinancialProductDbo[] = await dbService
        .table('financial_products')
        .select('orgId','title','created_at', 'updated_at')
        .where("mode", mode)
        .orderBy('updated_at', 'desc');

      return FinancialProductDbos;
    } catch (error) {
      console.log('error ', error)
      throw errorService.handleDbError('getAllFinancialProducts', error);
    }
  }

  async getFinancialProductById(orgId:string) {
    try {
      const FinancialProductDbos: FinancialProductDbo[] = await dbService
        .table('financial_products')
        .select('orgId','title','created_at','updated_at')
        .where("orgId", orgId )
        .orderBy('updated_at', 'desc');

      return FinancialProductDbos;
    } catch (error) {
      console.log('error ', error)
      throw errorService.handleDbError('getFinancialProductById', error);
    }
  }

}

export const financialProductsDbGetter = new FinancialProductsDbGetters();
