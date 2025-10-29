import { dbService, errorService } from '@server/common';
import { sharedUtilService } from '@shared/common/services/shared-util.service';
import { OrgEntitlementDbo } from './org-entitlements.model';

class OrgEntitlementsDbCreators {
  async createOrgEntitlement(orgEntitlement: OrgEntitlementDbo) {
    try {
        await dbService.table('org_entitlements').insert({
          ...orgEntitlement,
          id: orgEntitlement.id || sharedUtilService.generateUid()
        }).onConflict( "orgId" ).merge();
    } catch (error) {
        console.log('error ', error)
        throw errorService.handleDbError('createOrgEntitlement', error);
    }
  }

  async createCmsEntitlements(orgEntitlement, orgEntitlementItem = {}, pricingOption1Labels={}) {
    console.log(orgEntitlementItem)
    try {
      let result = [];
      if (orgEntitlement.id) {
        const id = orgEntitlement.id;
        delete orgEntitlement.id;
        result = await dbService.table('crm_entitlements').where('id', id).update({...orgEntitlement, ...pricingOption1Labels}).returning('id');
      } else {
        result = await dbService.table('crm_entitlements').insert({
          ...orgEntitlement, 
          ...pricingOption1Labels,
          id: orgEntitlement.id || sharedUtilService.generateUid()
        }).returning('id');
      }
      console.log(result)
      if (result[0]) {
        await dbService.table('crm_entitlement_item').insert({
          ...orgEntitlementItem,
          id: orgEntitlementItem.id || sharedUtilService.generateUid(),
          crm_entitlements_id: result[0]
        })
      }
    } catch (error) {
      console.log('error ', error)
      throw errorService.handleDbError('createCmsEntitlements', error);
    }
  }
}

export const orgEntitlementsDbCreators = new OrgEntitlementsDbCreators();
