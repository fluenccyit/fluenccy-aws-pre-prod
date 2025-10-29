import { dbService, errorService } from '@server/common';
import { sharedUtilService } from '@shared/common/services/shared-util.service';
import { OrgEntitlementDbo } from './org-entitlements.model';

class OrgEntitlementsDbGetters {
  async getOrgEntitlements(orgId:string, mode:string) {
    try {
      var orgEntitlementsDbos: OrgEntitlementDbo[] = await dbService
        .table('org_entitlements')
        .select('id', 'forwardMarginPercentage', 'limitOrderMarginPercentage', 'spotMarginPercentage', 'forwardPercentage','spotPercentage','orderPercentage','marginPercentage','avgOrder','budgetDiscount','hedgePercentage','hedgeAdjustment','EFTAdjustment','volAdjustment','orderAdjustmentPlus','orderAdjustmentMinus', 'orderProbability', 'minimumProbability', 'maximumProbability', 'setOptimised', 'fi_name','fi_email','minPercentAboveSpot','maxPercentOnOrder', 'maxForwardPercent', 'minForwardPercent', 'plan_approval_email','createdBy', 'updatedBy', 'created_at', 'updated_at', 'showInversedRate')
        .where("orgId", orgId )
        .where('mode', mode)
        .orderBy('updated_at', 'desc');

        if( orgEntitlementsDbos.length == 0 ) {
          let dbos = await dbService.table('org_entitlements').insert({"id": sharedUtilService.generateUid(), "orgId": orgId, "mode": mode??'default'});
          orgEntitlementsDbos = await dbService
            .table('org_entitlements')
            .select('id', 'forwardMarginPercentage', 'limitOrderMarginPercentage', 'spotMarginPercentage', 'forwardPercentage','spotPercentage','orderPercentage','marginPercentage','avgOrder','budgetDiscount','hedgePercentage','hedgeAdjustment','EFTAdjustment','volAdjustment','orderAdjustmentPlus','orderAdjustmentMinus', 'orderProbability', 'minimumProbability', 'maximumProbability', 'setOptimised', 'fi_name','fi_email','minPercentAboveSpot','maxPercentOnOrder','plan_approval_email','createdBy', 'updatedBy', 'created_at', 'updated_at','showInversedRate')
          .where("orgId", orgId )
          .orderBy('updated_at', 'desc');
        }

      return orgEntitlementsDbos;
    } catch (error) {
      console.log('error ', error)
      throw errorService.handleDbError('getOrgEntitlements', error);
    }
  }

  async getMarginPercentage(orgId:string, mode: string) {
    try {
      var orgEntitlementsDbos: OrgEntitlementDbo[] = await dbService
        .table('org_entitlements')
        .select('forwardMarginPercentage', 'limitOrderMarginPercentage', 'spotMarginPercentage', 'orderProbability', 'minimumProbability', 'maximumProbability', 'marginPercentage', 'setOptimised')
        .where("orgId", orgId )
        .where('mode', mode);

      if( orgEntitlementsDbos.length == 0 ) {
        let dbos = await dbService.table('org_entitlements').insert({"id": sharedUtilService.generateUid(), "orgId": orgId});
        orgEntitlementsDbos = await dbService
        .table('org_entitlements')
        .select('forwardMarginPercentage', 'limitOrderMarginPercentage', 'spotMarginPercentage', 'orderProbability', 'minimumProbability', 'maximumProbability', 'marginPercentage', 'setOptimised')
        .where("orgId", orgId );
      }

      return orgEntitlementsDbos;
    } catch (error) {
      console.log('error ', error)
      throw errorService.handleDbError('getMarginPercentage', error);
    }
  }

  async getPlanApprovalEmail(orgId:string, mode:string) {
    try {
      var orgEntitlementsDbos: OrgEntitlementDbo[] = await dbService
        .table('org_entitlements')
        .select('plan_approval_email')
        .where("orgId", orgId )
        .where("mode", mode);

      return orgEntitlementsDbos;
    } catch (error) {
      console.log('error ', error)
      throw errorService.handleDbError('getMarginPercentage', error);
    }
  }

  async getOrgCmsEntitlements(orgId:string, isPricing: boolean= false, mode:string) {
    try {
      const orgEntitlementsDbos = await dbService
        .table('crm_entitlements')
        .select('id','currencyCode','orgId','createdBy', 'updatedBy', 'created_at', 'updated_at', 'pricingOption1Label', 'pricingOption2Label', 'pricingOption3Label')
        .where("orgId", orgId )
        .where("isPricing",isPricing)
        .where("mode",mode)
        .orderBy('updated_at', 'desc');
      let orgEntitlementItemDbos = [];
      if (orgEntitlementsDbos.length) {
        const ids = orgEntitlementsDbos.map(o => o.id);
        orgEntitlementItemDbos = await dbService
        .table('crm_entitlement_item')
        .select('id','name','max', 'min', 'crm_entitlements_id', 'text')
        .whereIn('crm_entitlements_id', ids)
      }

      const groupByIds = orgEntitlementItemDbos.reduce((acc, r) => {
        acc[r.crm_entitlements_id] = [...(acc[r.crm_entitlements_id] || []), r];
        return acc;
      }, {});

      return orgEntitlementsDbos.map(o => {
        return {
          ...o,
          orgEntitlementItems: groupByIds[o.id]
        }
      });
    } catch (error) {
      console.log('error ', error)
      throw errorService.handleDbError('getOrgCmsEntitlements', error);
    }
  }

  async getCurrencies(orgId: string, mode: string) {
    try {
      return await dbService
        .table('crm_entitlement_item')
        .leftJoin('crm_entitlements', 'crm_entitlements.id', 'crm_entitlement_item.crm_entitlements_id')
        .distinct()
        .select('crm_entitlements.currencyCode')
        .where({orgId, mode});
    } catch (error) {
      console.log('error ', error)
      throw errorService.handleDbError('getOrgCmsEntitlements', error);
    }
  }

}

export const orgEntitlementsDbGetters = new OrgEntitlementsDbGetters();
