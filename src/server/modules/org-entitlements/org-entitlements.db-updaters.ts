import { dbService, errorService } from '@server/common';
import { OrgEntitlementDbo } from './org-entitlements.model';

import { isArray } from 'lodash';

class OrgEntitlementsDbUpdaters {
  async updateOrgEntitlement(
    orgId: string,
    forwardPercentage: number,
    spotPercentage: number,
    orderPercentage: number,
    marginPercentage: number,
    avgOrder: number,
    budgetDiscount: number,
    hedgePercentage: number,
    hedgeAdjustment: number,
    EFTAdjustment: number,
    volAdjustment: number,
    orderAdjustmentPlus: number,
    orderAdjustmentMinus: number,
    minPercentAboveSpot: number,
    maxPercentOnOrder: number,
    minForwardPercent: number,
    maxForwardPercent: number,
    orderProbability: number,
    minimumProbability: number,
    maximumProbability: number,
    forwardMarginPercentage: number,
    limitOrderMarginPercentage: number,
    spotMarginPercentage: number,
    setOptimised: boolean,
    mode: string,
    showInversedRate: boolean = false
  ) {
    try {
      await dbService
        .table('org_entitlements')
        .where('orgId', orgId)
        .where('mode', mode)
        .update('forwardPercentage', forwardPercentage)
        .update('spotPercentage', spotPercentage)
        .update('orderPercentage', orderPercentage)
        .update('marginPercentage', marginPercentage)
        .update('avgOrder', avgOrder)
        .update('budgetDiscount', budgetDiscount)
        .update('hedgePercentage', hedgePercentage)
        .update('hedgeAdjustment', hedgeAdjustment)
        .update('EFTAdjustment', EFTAdjustment)
        .update('volAdjustment', volAdjustment)
        .update('orderAdjustmentPlus', orderAdjustmentPlus)
        .update('orderAdjustmentMinus', orderAdjustmentMinus)
        .update('minPercentAboveSpot', minPercentAboveSpot)
        .update('maxPercentOnOrder', maxPercentOnOrder)
        .update('minForwardPercent', minForwardPercent)
        .update('maxForwardPercent', maxForwardPercent)
        .update('orderProbability', orderProbability)
        .update('forwardMarginPercentage', forwardMarginPercentage)
        .update('limitOrderMarginPercentage', limitOrderMarginPercentage)
        .update('spotMarginPercentage', spotMarginPercentage)
        .update('minimumProbability', minimumProbability)
        .update('maximumProbability', maximumProbability)
        .update('setOptimised', setOptimised)
        .update('showInversedRate', showInversedRate);
    } catch (error) {
      console.log('error ', error);
      throw errorService.handleDbError('updateOrgEntitlement', error);
    }
  }

  async updatePlanApprovalEmail(orgId: string, plan_approval_email: string, mode:string) {
    try {
      await dbService.table('org_entitlements').where('orgId', orgId).where('mode', mode).update('plan_approval_email', plan_approval_email);
    } catch (error) {
      console.log('error ', error);
      throw errorService.handleDbError('updatePlanApprovalEmail', error);
    }
  }

  async updateMarginPercentage(orgId: string, marginPercentage: number, mode: string) {
    try {
      await dbService.table('org_entitlements').where('orgId', orgId).where('mode', mode).update('marginPercentage', marginPercentage);
    } catch (error) {
      console.log('error ', error);
      throw errorService.handleDbError('updateMarginPercentage', error);
    }
  }

  async updateFinancialInstitute(orgId: string, fi_name: string, fi_email: string, mode: string) {
    try {
      await dbService.table('org_entitlements').where('orgId', orgId).where('mode', mode).update('fi_name', fi_name).update('fi_email', fi_email);
    } catch (error) {
      console.log('error ', error);
      throw errorService.handleDbError('updateFinancialInstitute', error);
    }
  }

  async updateCmsEntitlements(record, id, pricingOption1Labels, crmEntitlementId) {
    try {
      if (pricingOption1Labels) {
        console.log(pricingOption1Labels, crmEntitlementId)
        await dbService.table('crm_entitlements').where('id', crmEntitlementId).update(pricingOption1Labels);
      }
      await dbService.table('crm_entitlement_item').where('id', id).update(record);
    } catch (error) {
      console.log('error ', error);
      throw errorService.handleDbError('updateCmsEntitlement', error);
    }
  }
}

export const orgEntitlementsDbUpdaters = new OrgEntitlementsDbUpdaters();
