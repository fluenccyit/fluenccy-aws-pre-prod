import { ResponseModel } from '../shared/response.model';
var csv = require('csvtojson');
import { sharedUtilService } from '@shared/common';
import { MailDataRequired } from '@sendgrid/mail';
import { orgEntitlementsDbGetters } from './org-entitlements.db-getters';
import { orgEntitlementsDbUpdaters } from './org-entitlements.db-updaters';
import { emailService, loggerService, SENDGRID_TEMPLATE_IDS } from '@server/common';
const { DOMAIN } = process.env;
import BaseController from '../shared/base.controller';
import { from } from '@apollo/client';
import { env } from 'process';
const fs = require('fs');
import axios from 'axios';
import moment from 'moment';
import { orgEntitlementsDbCreators } from './org-entitlements.db-creators';

class OrgEntitlementsController extends BaseController {
  constructor() {
    super(__filename);
  }

  /**
   * @summary `Create Org Entitlements`
   * @param {any} req
   * @param {any} res
   * @memberof OrgEntitlementsController
   */
  async createOrgEntitlements(req: any, res: any) {
    try {
      const user = await this.getSessionUser(req);
      if (!user) {
        return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
      }
      if (
        'orgId' in req.body &&
        'forwardPercentage' in req.body &&
        'spotPercentage' in req.body &&
        'marginPercentage' in req.body &&
        'hedgeAdjustment' in req.body &&
        'EFTAdjustment' in req.body &&
        'orderAdjustmentPlus' in req.body &&
        'orderAdjustmentMinus' in req.body &&
        'forwardMarginPercentage' in req.body &&
        'limitOrderMarginPercentage' in req.body &&
        'spotMarginPercentage' in req.body
      ) {
        const orgEntitlementId = sharedUtilService.generateUid();
        const orgEntitlementWithId = {
          ...req.body,
          id: orgEntitlementId
        };

        const arrRecords = await orgEntitlementsDbCreators.createOrgEntitlement(orgEntitlementWithId);
        let data = { OrgEntitlements: arrRecords };
        return this.sendResponse(res, this.getResponseObject(null, data, true, 200, ''));
      } else {
        return this.sendResponse(res, this.getResponseObject(null, [], false, 400, 'Invalid request'));
      }
    } catch (err) {
      console.log('err ', err);
      return this.sendResponse(res, this.getResponseObject(null, err, false, 500, 'error occured'));
    }
  }

  /**
   * @summary `Return Org Entitlements`
   * @param {any} req
   * @param {any} res
   * @memberof OrgEntitlementsController
   */
  async getOrgEntitlements(req: any, res: any) {
    try {
      const user = await this.getSessionUser(req);
      if (!user) {
        return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
      }
      if ('orgId' in req.body) {
        const arrRecords = await orgEntitlementsDbGetters.getOrgEntitlements(req.body.orgId, req.body.mode);
        let data = { OrgEntitlements: arrRecords };
        return this.sendResponse(res, this.getResponseObject(null, data, true, 200, ''));
      } else {
        return this.sendResponse(res, this.getResponseObject(null, [], false, 400, 'Invalid request'));
      }
    } catch (err) {
      console.log('err ', err);
      return this.sendResponse(res, this.getResponseObject(null, err, false, 500, 'error occured'));
    }
  }

  /**
   * @summary `Update Org Entitlements`
   * @param {any} req
   * @param {any} res
   * @memberof OrgEntitlementsController
   */
  async updateOrgEntitlements(req: any, res: any) {
    try {
      const user = await this.getSessionUser(req);
      if (!user) {
        return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
      }
      if (
        'orgId' in req.body &&
        'orderProbability' in req.body &&
        'forwardPercentage' in req.body &&
        'spotPercentage' in req.body &&
        'marginPercentage' in req.body &&
        'hedgeAdjustment' in req.body &&
        'EFTAdjustment' in req.body &&
        'orderAdjustmentPlus' in req.body &&
        'orderAdjustmentMinus' in req.body &&
        'forwardMarginPercentage' in req.body &&
        'limitOrderMarginPercentage' in req.body &&
        'spotMarginPercentage' in req.body &&
        'minimumProbability' in req.body &&
        'maximumProbability' in req.body
      ) {
        const arrRecords = await orgEntitlementsDbUpdaters.updateOrgEntitlement(
          req.body.orgId,
          req.body.forwardPercentage,
          req.body.spotPercentage,
          req.body.limitPercentage,
          req.body.marginPercentage,
          req.body.avgOrder,
          req.body.budgetDiscount,
          req.body.hedgePercentage,
          req.body.hedgeAdjustment,
          req.body.EFTAdjustment,
          req.body.volAdjustment,
          req.body.orderAdjustmentPlus,
          req.body.orderAdjustmentMinus,
          req.body.minPercentAboveSpot,
          req.body.maxPercentOnOrder,
          req.body.minForwardPercent,
          req.body.maxForwardPercent,
          req.body.orderProbability,
          req.body.minimumProbability,
          req.body.maximumProbability,
          req.body.forwardMarginPercentage,
          req.body.limitOrderMarginPercentage,
          req.body.spotMarginPercentage,
          req.body.setOptimised,
          req.body.mode,
          req.body.showInversedRate
        );
        return this.sendResponse(res, this.getResponseObject(null, arrRecords, true, 200, ''));
      } else {
        return this.sendResponse(res, this.getResponseObject(null, [], false, 400, 'Invalid request'));
      }
    } catch (err) {
      console.log('err ', err);
      return this.sendResponse(res, this.getResponseObject(null, err, false, 500, 'error occured'));
    }
  }

  /**
   * @summary `Return Margin Percentage`
   * @param {any} req
   * @param {any} res
   * @memberof OrgEntitlementsController
   */
  async getMarginPercentage(req: any, res: any) {
    try {
      const user = await this.getSessionUser(req);
      if (!user) {
        return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
      }
      if ('orgId' in req.body) {
        const arrRecords = await orgEntitlementsDbGetters.getMarginPercentage(req.body.orgId, req.body.mode);
        return this.sendResponse(res, this.getResponseObject(null, arrRecords, true, 200, ''));
      } else {
        return this.sendResponse(res, this.getResponseObject(null, [], false, 400, 'Invalid request'));
      }
    } catch (err) {
      console.log('err ', err);
      return this.sendResponse(res, this.getResponseObject(null, err, false, 500, 'error occured'));
    }
  }

  /**
   * @summary `Update Margin Percentage`
   * @param {any} req
   * @param {any} res
   * @memberof OrgEntitlementsController
   */
  async updateMarginPercentage(req: any, res: any) {
    try {
      const user = await this.getSessionUser(req);
      if (!user) {
        return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
      }
      if ('orgId' in req.body && 'marginPercentage' in req.body) {
        const arrRecords = await orgEntitlementsDbUpdaters.updateMarginPercentage(req.body.orgId, req.body.marginPercentage, req.body.mode);
        return this.sendResponse(res, this.getResponseObject(null, arrRecords, true, 200, ''));
      } else {
        return this.sendResponse(res, this.getResponseObject(null, [], false, 400, 'Invalid request'));
      }
    } catch (err) {
      console.log('err ', err);
      return this.sendResponse(res, this.getResponseObject(null, err, false, 500, 'error occured'));
    }
  }

  /**
   * @summary `Update Financial Institute`
   * @param {any} req
   * @param {any} res
   * @memberof OrgEntitlementsController
   */
  async updateFinancialInstitute(req: any, res: any) {
    try {
      const user = await this.getSessionUser(req);
      if (!user) {
        return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
      }
      if ('orgId' in req.body && 'fi_name' in req.body && 'fi_email' in req.body) {
        const arrRecords = await orgEntitlementsDbUpdaters.updateFinancialInstitute(req.body.orgId, req.body.fi_name, req.body.fi_email, req.body.mode);
        return this.sendResponse(res, this.getResponseObject(null, arrRecords, true, 200, ''));
      } else {
        return this.sendResponse(res, this.getResponseObject(null, [], false, 400, 'Invalid request'));
      }
    } catch (err) {
      console.log('err ', err);
      return this.sendResponse(res, this.getResponseObject(null, err, false, 500, 'error occured'));
    }
  }

  /**
   * @summary `Return Plan Approval Email`
   * @param {any} req
   * @param {any} res
   * @memberof OrgEntitlementsController
   */
  async getPlanApprovalEmail(req: any, res: any) {
    try {
      const user = await this.getSessionUser(req);
      if (!user) {
        return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
      }
      if ('orgId' in req.body) {
        const arrRecords = await orgEntitlementsDbGetters.getPlanApprovalEmail(req.body.orgId, req.body.mode);
        return this.sendResponse(res, this.getResponseObject(null, arrRecords, true, 200, ''));
      } else {
        return this.sendResponse(res, this.getResponseObject(null, [], false, 400, 'Invalid request'));
      }
    } catch (err) {
      console.log('err ', err);
      return this.sendResponse(res, this.getResponseObject(null, err, false, 500, 'error occured'));
    }
  }

  /**
   * @summary `Update Plan Approval Email`
   * @param {any} req
   * @param {any} res
   * @memberof OrgEntitlementsController
   */
  async updatePlanApprovalEmail(req: any, res: any) {
    try {
      const user = await this.getSessionUser(req);
      if (!user) {
        return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
      }
      if ('orgId' in req.body && 'plan_approval_email' in req.body) {
        const arrRecords = await orgEntitlementsDbUpdaters.updatePlanApprovalEmail(req.body.orgId, req.body.plan_approval_email, req.body.mode);
        return this.sendResponse(res, this.getResponseObject(null, arrRecords, true, 200, ''));
      } else {
        return this.sendResponse(res, this.getResponseObject(null, [], false, 400, 'Invalid request'));
      }
    } catch (err) {
      console.log('err ', err);
      return this.sendResponse(res, this.getResponseObject(null, err, false, 500, 'error occured'));
    }
  }

  /**
   * @summary `Return Org Entitlements`
   * @param {any} req
   * @param {any} res
   * @memberof CmsEntitlementsController
   */
  async getCmsEntitlements(req: any, res: any) {
    try {
      const user = await this.getSessionUser(req);
      if (!user) {
        return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
      }
      if ('orgId' in req.body) {
        const arrRecords = await orgEntitlementsDbGetters.getOrgCmsEntitlements(req.body.orgId, req.body.isPricing, req.body.mode);
        let data = { cmsEntitlements: arrRecords };
        return this.sendResponse(res, this.getResponseObject(null, data, true, 200, ''));
      } else {
        return this.sendResponse(res, this.getResponseObject(null, [], false, 400, 'Invalid request'));
      }
    } catch (err) {
      console.log('err ', err);
      return this.sendResponse(res, this.getResponseObject(null, err, false, 500, 'error occured'));
    }
  }

  /**
   * @summary `Create Org Entitlements`
   * @param {any} req
   * @param {any} res
   * @memberof OrgEntitlementsController
   */
  async updateCmsEntitlements(req: any, res: any) {
    try {
      const user = await this.getSessionUser(req);
      if (!user) {
        return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
      }
      if ('orgId' in req.body && 'currencyCode' in req.body) {
        let arrRecords;
        const id = req.body.orgEntitlementItem.id;
        delete req.body.orgEntitlementItem.id;
        const orgEntitlementItem = req.body.orgEntitlementItem;
        delete req.body.orgEntitlementItem;
        delete req.body.orgEntitlementItems;
        delete req.body.pricingOption1Label;
        delete req.body.pricingOption2Label;
        delete req.body.pricingOption3Label;
        const pricingOption1Labels = req.body.pricingLabels;
        delete req.body.pricingLabels;
        const crmEntitlementId = req.body.id;
        if (id) {
          arrRecords = await orgEntitlementsDbUpdaters.updateCmsEntitlements(orgEntitlementItem, id, pricingOption1Labels, crmEntitlementId);
        } else {
          arrRecords = await orgEntitlementsDbCreators.createCmsEntitlements(req.body, orgEntitlementItem, pricingOption1Labels);
        }
        let data = { cmsEntitlements: arrRecords };
        return this.sendResponse(res, this.getResponseObject(null, data, true, 200, ''));
      } else {
        return this.sendResponse(res, this.getResponseObject(null, [], false, 400, 'Invalid request'));
      }
    } catch (err) {
      console.log('err ', err);
      return this.sendResponse(res, this.getResponseObject(null, err, false, 500, 'error occured'));
    }
  }
}

export default OrgEntitlementsController;
