import { errorService, dbService } from '@server/common';
import { InvoiceDbo } from '@server/invoice';

class HedgeInvoiceDbUpdater {
  async updateInvoice(orgId:string, tenantId: string, arrBucketInvoices:any, hedgingType: string) {
    try {
      // setting isAddedToBucket to true
      const records = await dbService.table('hedge_invoice')
      .whereIn('invoiceId', arrBucketInvoices.map(r => r.invoiceId))
      .update('isAddedToBucket', true)
      .update('hedgingType', hedgingType);
    } catch (error) {
      throw errorService.handleDbError('hedge_invoice', error);
    }
  }

  async updateIMSInvoice(tenantId: string, invoiceId:any, manageType: string, type: string, isPricing = false, isGeneratedTermSheet = false, pricingLabelField = "", counterPartyEntitlementItemId = '') {
    try {
      if( type == 'unmanaged' ) {
        const delRecords = await dbService.table('buying_schedule').delete().where('invoiceId', invoiceId);
      }

      const records = await dbService.table('hedge_invoice')
        .where('invoiceId', invoiceId)
        .where('tenantId', tenantId)
        .update('type', type)
        .update('manage_type', manageType)
        .update('isPricing', isPricing)
        .update('isGeneratedTermSheet', isGeneratedTermSheet)
        .update('pricingLabelField', pricingLabelField)
        .update('counterPartyEntitlementItemId', counterPartyEntitlementItemId);
      
    } catch( error ) {
      console.log('error ', error)
      throw errorService.handleDbError('hedge_invoice', error);
    }
  }

  async updatePricingInvoice(invoiceId:any, isGeneratedTermSheet: boolean = false) {
    try {
      return await dbService.table('hedge_invoice')
        .where('invoiceId', invoiceId)
        .update('isGeneratedTermSheet', isGeneratedTermSheet);
      
    } catch( error ) {
      throw errorService.handleDbError('hedge_invoice', error);
    }
  }

  async approveInvoice(invoiceId:any, currentCost: any, targetCost: any, forwardRate: any, optimizedRate: any) {
    try {      
        const records = await dbService.table('hedge_invoice')
        .where('invoiceId', invoiceId)
        .update('isApproved', true);

      await dbService.table('buying_schedule')
        .where('invoiceId', invoiceId)
        .update('forwardDate',new Date())
        .update('targetCost', targetCost)
        .update('currentCost', currentCost)
        .update('forwardRate', forwardRate)
        .update('optimizedRate', optimizedRate);

      return records;
    } catch( error ) {
      throw errorService.handleDbError('hedge_invoice', error);
    }
  }

  async manageInvoice(invoiceId:any, currentCost: any, targetCost: any, forwardRate: any, optimizedRate: any) {
    try {      
      // const records = await dbService.table('hedge_invoice')
      //   .where('invoiceId', invoiceId)
      //   .update('isApproved', true);

      await dbService.table('buying_schedule')
        .where('invoiceId', invoiceId)
        .update('forwardDate',new Date())
        .update('targetCost', targetCost)
        .update('currentCost', currentCost)
        .update('forwardRate', forwardRate)
        .update('optimizedRate', optimizedRate);

      // return records;
    } catch( error ) {
      throw errorService.handleDbError('hedge_invoice', error);
    }
  }

  async autoApproveInvoice(tenantId: string, invoiceId:any) {
    try {
      const records = await dbService.table('hedge_invoice')
        .where('invoiceId', invoiceId)
        .where('tenantId', tenantId)
        .update('isAutoApproved', true);  
    } catch( error ) {
      throw errorService.handleDbError('hedge_invoice', error);
    }
  }

  async autoManageInvoice(tenantId: string, invoiceId:any) {
    try {
      const records = await dbService.table('hedge_invoice')
        .where('invoiceId', invoiceId)
        .where('tenantId', tenantId)
        .update('isAutoManaged', true);  
    } catch( error ) {
      throw errorService.handleDbError('hedge_invoice', error);
    }
  }

  async deleteRecurringPlan(id: string) {
    try {
      await dbService.table('recurring_plan').delete().where('id', id);
    } catch(error) {
      throw errorService.handleDbError('hedge_invoice', error);
    }
  }

  async updateRecurringPlan(id: string, endDate:Date, capVolume:any, approvalMethod:string) {
    try {
      await dbService.table('recurring_plan')
      .where('id', id)
      .update('endDate',endDate)
      .update('capVolume',capVolume)
      .update('approvalMethod',approvalMethod)
    } catch(error) {
      throw errorService.handleDbError('hedge_invoice', error);
    }
  }

  async updateBuyingSchedule(invoiceId:any, data:object) {
    try {
      console.log("data", data)
      await dbService.table('buying_schedule')
        .where('invoiceId', invoiceId)
        .update(data);
    } catch( error ) {
      throw errorService.handleDbError('hedge_invoice', error);
    }
  }

  async markAsPaidAndReceived(invoiceId:any) {
    try {
      await dbService.table('hedge_invoice')
        .where('invoiceId', invoiceId)
        .update({isMarkedAsPaid: true});
    } catch( error ) {
      throw errorService.handleDbError('hedge_invoice', error);
    }
  }

  async markAsReceived(invoiceId:any) {
    try {
      await dbService.table('hedge_invoice')
        .where('invoiceId', invoiceId)
        .update({isMarkedAsReceived: true});
    } catch( error ) {
      throw errorService.handleDbError('hedge_invoice', error);
    }
  }
}

export const invoiceDbUpdaters = new HedgeInvoiceDbUpdater();
