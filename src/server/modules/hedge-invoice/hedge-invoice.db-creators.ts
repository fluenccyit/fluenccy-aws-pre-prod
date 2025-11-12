import { dbService, errorService } from '@server/common';
import { sharedUtilService } from '@shared/common/services/shared-util.service';
import { BuyingScheduleDbo, RecurringPlanDbo } from './hedge-invoice.model';

class HedgeInvoiceDbCreators {
  async createBuyingSchedule(buyingSchedule: BuyingScheduleDbo) {
    try {
      if (buyingSchedule.isHedgedEverything) {
        buyingSchedule.optimaisedPer = 100;
      }
      await dbService.table('buying_schedule').insert({...buyingSchedule, id: sharedUtilService.generateUid()}).onConflict( "invoiceId" ).merge();
    } catch (error) {
      console.log('error ', error)
      throw errorService.handleDbError('createOrganisationUser', error);
    }
  }

  async createRecurringPlan(recurringPlan:RecurringPlanDbo){
      await dbService.table('recurring_plan').insert({
        ...recurringPlan,
        id: recurringPlan.id || sharedUtilService.generateUid()
      });
    } catch (error:any) {
      console.log('error ', error)
      throw errorService.handleDbError('createRecurringPlan', error);
    }
  }


export const hedgeInvoiceDbCreators = new HedgeInvoiceDbCreators();
