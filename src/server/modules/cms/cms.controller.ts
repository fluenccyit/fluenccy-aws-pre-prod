import { ResponseModel } from '../shared/response.model'
var csv = require("csvtojson");
import  {map,last, isEmpty} from 'lodash';
import { sharedUtilService} from '@shared/common';
import { dateService, DATE_TIME_FORMAT} from '@server/common';
import { MailDataRequired } from '@sendgrid/mail';
import { entriesDbGetters } from './cms.db-getters';
import { entriesDbUpdaters } from './cms.db-updaters';
import {orgEntitlementsDbGetters} from '../org-entitlements/org-entitlements.db-getters';
import { emailService, loggerService, SENDGRID_TEMPLATE_IDS } from '@server/common';
const { DOMAIN } = process.env;
import BaseController from '../shared/base.controller'
import { from } from '@apollo/client';
import { env } from 'process';
const fs = require("fs");
import axios from 'axios';
import moment from "moment";
import fetch from 'cross-fetch';
import { URLSearchParams } from 'url';
import { invoiceDbCreators } from '@server/invoice';
import { organisationDbGetters } from '@server/organisation/organisation.db-getters';
import { rateDbGetters } from '@server/rate/rate.db-getters';
import { Invoice as XeroInvoice, Payment as XeroPayment } from 'xero-node';
import { GqlSupportedCurrency } from '@graphql';
import { paymentDbCreators, paymentService } from '@server/payment';
import { organisationResource } from '@server/organisation';
import { rateService } from '@server/rate';

export type XeroInvoiceStatus = keyof typeof XeroInvoice.StatusEnum;
export type XeroPaymentStatus = keyof typeof XeroPayment.StatusEnum;
export type XeroInvoiceType = keyof typeof XeroInvoice.TypeEnum;
export type XeroPaymentType = keyof typeof XeroPayment.PaymentTypeEnum;

class CmsEntriesController extends BaseController {

    constructor() {
        super(__filename);
    }

    /**
     * @summary `Return Managed/Unmanaged Invoices`
     * @param {any} req
     * @param {any} res
     * @memberof CMSEntriesController
    */
     async getEntries(req: any, res: any) {
        try {
            const user = await this.getSessionUser(req);
            if (!user) {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
            }

            if ('orgId' in req.body && 'currencyCode' in req.body && 'orgCurrency' in req.body) {
                const arrRecords = await entriesDbGetters.getEntries(req.body.orgId, req.body.currencyCode, req.body.type);
                const marginPercentage = await orgEntitlementsDbGetters.getMarginPercentage( req.body.orgId, null );
                const years = [], months = [];
                arrRecords.forEach(o => {
                    years.push(o.year);
                    months.push(o.month);
                });
                const forwardPoints = await entriesDbGetters.queryForwardPointFor([...(new Set(years))], [...(new Set(months))], req.body.orgCurrency, req.body.currencyCode);
                let data = { "entries": arrRecords, marginPercentage, forwardPoints };
                return this.sendResponse(res, this.getResponseObject(null, data, true, 200, ""));
            } else {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 400, 'Invalid request'));
            }
        } catch (err) {
            console.log('err ', err)
            return this.sendResponse(res, this.getResponseObject(null, err, false, 500, "error occured"));
        }
    }

    /**
     * @summary `Return Managed/Unmanaged Invoices`
     * @param {any} req
     * @param {any} res
     * @memberof CMSEntriesController
    */
    async updateEntry(req: any, res: any) {
        try {
            const user = await this.getSessionUser(req);
            if (!user) {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
            }
            console.log(req.body);
            if ('orgId' in req.body && 'id' in req.body && 'params' in req.body) {
                const arrRecords = await entriesDbUpdaters.updateEntry(req.body.orgId, req.body.id, req.body.params, user);
                let data = { "entries": arrRecords };
                return this.sendResponse(res, this.getResponseObject(null, data, true, 200, ""));
            } else {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 400, 'Invalid request'));
            }
        } catch (err) {
            console.log('err ', err)
            return this.sendResponse(res, this.getResponseObject(null, err, false, 500, "error occured"));
        }
    }
    
    /**
     * @summary `Return Managed/Unmanaged Invoices`
     * @param {any} req
     * @param {any} res
     * @memberof CMSEntriesController
    */
    async getFeedback(req: any, res: any) {
        try {
            const user = await this.getSessionUser(req);
            if (!user) {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
            }

            if ('orgId' in req.body) {
                const arrRecords = await entriesDbGetters.getFeedbacks(req.body.orgId, req.body.isPricing);
                let data = { "entries": arrRecords };
                return this.sendResponse(res, this.getResponseObject(null, data, true, 200, ""));
            } else {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 400, 'Invalid request'));
            }
        } catch (err) {
            console.log('err ', err)
            return this.sendResponse(res, this.getResponseObject(null, err, false, 500, "error occured"));
        }
    }
    
    /**
     * @summary `update feedback`
     * @param {any} req
     * @param {any} res
     * @memberof CMSEntriesController
    */
    async updateFeedback(req: any, res: any) {
        try {
            const user = await this.getSessionUser(req);
            if (!user) {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
            }
            if ('reservedAmount' in req.body && 'reservedRate' in req.body && 'reservedDate' in req.body) {
                const id = req.body.id;
                delete req.body.id;
                const arrRecords = await entriesDbUpdaters.updateFeedback(id, {...req.body, createdBy: user.id, updatedBy: user.id});
                let data = { "entries": arrRecords };
                return this.sendResponse(res, this.getResponseObject(null, data, true, 200, ""));
            } else {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 400, 'Invalid request'));
            }
        } catch (err) {
            console.log('err ', err)
            return this.sendResponse(res, this.getResponseObject(null, err, false, 500, "error occured"));
        }
    }
    
    /**
     * @summary `getTransactions`
     * @param {any} req
     * @param {any} res
     * @memberof CMSEntriesController
    */
    async getTransactions(req: any, res: any) {
        try {
            const user = await this.getSessionUser(req);
            if (!user) {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
            }

            if ('orgId' in req.body) {
                const arrRecords = await entriesDbGetters.getTransactions(req.body.orgId);
                let data = { "entries": arrRecords };
                return this.sendResponse(res, this.getResponseObject(null, data, true, 200, ""));
            } else {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 400, 'Invalid request'));
            }
        } catch (err) {
            console.log('err ', err)
            return this.sendResponse(res, this.getResponseObject(null, err, false, 500, "error occured"));
        }
    }

    /**
     * @summary `get archives entry`
     * @param {any} req
     * @param {any} res
     * @memberof CMSEntriesController
    */
    async getArchives(req: any, res: any) {
        try {
            const user = await this.getSessionUser(req);
            if (!user) {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
            }

            if ('orgId' in req.body) {
                const arrRecords = await entriesDbGetters.getArchives(req.body.orgId);
                let data = { "entries": arrRecords };
                return this.sendResponse(res, this.getResponseObject(null, data, true, 200, ""));
            } else {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 400, 'Invalid request'));
            }
        } catch (err) {
            console.log('err ', err)
            return this.sendResponse(res, this.getResponseObject(null, err, false, 500, "error occured"));
        }
    }

    /**
     * @summary `get last month rates`
     * @param {any} req
     * @param {any} res
     * @memberof CMSEntriesController
    */
    async getRates(req: any, res: any) {
        try {
            const user = await this.getSessionUser(req);
            if (!user) {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
            }
            let arrRecords = [];
            let counter = 0;
            while(arrRecords.length === 0 && counter < 7) {
                const date = moment().subtract(1, 'month').endOf('month').subtract(counter, 'days').format('YYYY-MM-DD');
                arrRecords = await entriesDbGetters.getRates(date, date, req.body.baseCurrency);
                counter++;
            }
            
            const formattedRates = arrRecords.reduce((acc, r) => {
                acc[`${r.baseCurrency}${r.tradeCurrency}`] = r.last;
                return acc;
              }, {});
            const data = { "rates": formattedRates };
            return this.sendResponse(res, this.getResponseObject(null, data, true, 200, ""));
        } catch (err) {
            console.log('err ', err)
            return this.sendResponse(res, this.getResponseObject(null, err, false, 500, "error occured"));
        }
    }

    /**
     * @summary `get avarage rate for feedbacked record`
     * @param {any} req
     * @param {any} res
     * @memberof CMSEntriesController
    */
    async getAvgFeedbackRateByDate(req: any, res: any) {
        try {
            const user = await this.getSessionUser(req);
            if (!user) {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
            }
            let arrRecords = await entriesDbGetters.getAvgFeedbackRateByDate(req.body.orgId);
            const formattedRates = arrRecords.reduce((acc, r) => {
                if (!acc[r.currencyCode]) {
                    acc[r.currencyCode] = {};
                }
                
                if (Number(r.reservedRate) && r.reservedDate) {
                    const home = (acc[r.currencyCode]?.home || 0) + Number(r.homeCurrencyAmount);
                    const reserved = (acc[r.currencyCode]?.reserved || 0) + Number(r.reservedAmount);
                    const ids = acc[r.currencyCode]?.ids || [];
                    ids.push(r.entryId);
                    acc[r.currencyCode] = {home, reserved, ids};
                }
                return acc;
            }, {});
            const data = { "rates": formattedRates };
            return this.sendResponse(res, this.getResponseObject(null, data, true, 200, ""));
        } catch (err) {
            console.log('err ', err)
            return this.sendResponse(res, this.getResponseObject(null, err, false, 500, "error occured"));
        }
    }

    async getEntitlementCurrency(req: any, res: any) {
        try {
            const user = await this.getSessionUser(req);
            if (!user) {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
            }
            if ('orgId' in req.body) {
                const arrRecords = await orgEntitlementsDbGetters.getCurrencies(req.body.orgId, req.body.mode);
                const currencyHavingEntries = await entriesDbGetters.getEntryCount(req.body.orgId, req.body.mode);
                let data = { "currencyHavingPlan": arrRecords, currencyHavingEntries };
                return this.sendResponse(res, this.getResponseObject(null, data, true, 200, ""));
            } else {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 400, 'Invalid request'));
            }
        } catch (err) {
            console.log('err ', err)
            return this.sendResponse(res, this.getResponseObject(null, err, false, 500, "error occured"));
        }
    }
}

export default CmsEntriesController;
