import {last} from 'lodash';
import { invoiceDbGetters } from './quote-invoice.db-getters';
import { quoteInvoiceDbUpdaters } from './quote-invoice.db-updaters';
import {orgEntitlementsDbGetters} from '../org-entitlements/org-entitlements.db-getters';
import BaseController from '../shared/base.controller'
import axios from 'axios';
import moment from "moment";
import { quoteInvoiceDbCreators } from './quote-invoice.db-creators';
import { organisationDbGetters } from '@server/organisation/organisation.db-getters';
import { rateDbGetters } from '@server/rate/rate.db-getters';
import {jStat} from 'jstat';
import { Invoice as XeroInvoice, Payment as XeroPayment } from 'xero-node';
import { entriesDbGetters } from '../cms/cms.db-getters';
import { invoiceDbCreators as hedgeInvoiceDbCreator } from '@server/invoice/invoice.db-creators';
import { sharedUtilService } from '@shared/common';
import { XeroProcessedInvoice } from '../hedge-invoice/hedge-invoice.controller';
import { InvoiceDbo } from '@server/invoice';

export type XeroInvoiceStatus = keyof typeof XeroInvoice.StatusEnum;
export type XeroPaymentStatus = keyof typeof XeroPayment.StatusEnum;
export type XeroInvoiceType = keyof typeof XeroInvoice.TypeEnum;
export type XeroPaymentType = keyof typeof XeroPayment.PaymentTypeEnum;

const DAYS_FOR_CALCULATIONS = 365;

class QuoteInvoiceController extends BaseController {

    constructor() {
        super(__filename);
    }

    /**
     * @summary `Return Managed/Unmanaged Invoices`
     * @param {any} req
     * @param {any} res
     * @memberof QuoteInvoiceController
    */
     async getInvoices(req: any, res: any) {
        try {
            const user = await this.getSessionUser(req);
            if (!user) {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
            }

            if ('orgId' in req.body && 'tenantId' in req.body) {
                const arrRecords = await invoiceDbGetters.getInvoices(req.body.orgId, req.body.tenantId, req.body.currency, req.body.filter, req.body.type, req.body.isApproved, req.body.isPricing, req.body.view, req.body.mode, req.body.homeCurrencyCode, req.body.movedTo);
                const arrCurrencies = await invoiceDbGetters.getQuoteCurrencies(req.body.tenantId, req.body.orgId, req.body.mode);
                console.log("arrCurrencies", arrCurrencies)
                let homeCurrencies = [];
                if (req.body.mode) {
                    homeCurrencies = await invoiceDbGetters.getQuoteHomeCurrencies(req.body.tenantId, req.body.orgId, req.body.mode);
                }
                const marginPercentage = await orgEntitlementsDbGetters.getMarginPercentage( req.body.orgId, req.body.mode );
                let forwardPoints: any[] = [];
                let tradeCurrencies = [];
                var baseCurrencies = [];
                if ('baseCurrency' in req.body) {
                    if (req.body.baseCurrency && req.body.baseCurrency != 'ALL') {
                        baseCurrencies.push(req.body.baseCurrency);
                    }
                    const years = [], months = [];
                    arrRecords.forEach(o => {
                        const year = moment(o.dateDue).format('YYYY');
                        const month = moment(o.dateDue).format('MMM');
                        years.push(year);
                        months.push(month);
                        if(o.currencyCode) {
                            tradeCurrencies.push(o.currencyCode);
                        }

                        if (req.body.baseCurrency == 'ALL') {
                            baseCurrencies.push(o.homeCurrencyCode);
                        }
                    });
                    forwardPoints = await entriesDbGetters.queryForwardPointFor([...(new Set(years))], [...(new Set(months))], baseCurrencies, tradeCurrencies);
                }
                let data = { "invoices": arrRecords, "currencies": arrCurrencies, "marginPercentage": marginPercentage, forwardPoints, homeCurrencies };
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
     * @summary `Update Unmanaged Invoice`
     * @param {any} req
     * @param {any} res
     * @memberof QuoteInvoiceController
    */
     async updateInvoices(req: any, res: any) {
        try {
            const user = await this.getSessionUser(req);
            if (!user) {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
            }

            if ('orgId' in req.body && 'tenantId' in req.body && 'records' in req.body) {
                
                const {records} = req.body;

                const isXeroConnected = !req.body.tenantId.includes("tenant_");
                await sharedUtilService.asyncForEach(records, async (record: InvoiceDbo) => {
                    let tempInvoice;
                    if  (record.invoiceId){
                        const {invoiceNumber, date,dateDue, contactName, total, currencyCode, homeCurrencyCode, mode, currencyRate} = record;
                        tempInvoice = {
                            invoiceNumber,
                            date,
                            dateDue,
                            contactName,
                            total,
                            currencyCode,
                            homeCurrencyCode,
                            mode,
                            currencyRate
                        }
                        await quoteInvoiceDbUpdaters.updateInvoice(record.invoiceId, tempInvoice);
                    } else{
                        tempInvoice = {
                            ...record,
                            invoiceId: sharedUtilService.generateUid(''),
                            tenantId: req.body.tenantId,
                            provider:  isXeroConnected ? 'xero' : 'fluenccy',
                            invoiceStatus: req.body.mode ? 'RECEIVABLE' : 'PAYABLE',
                            invoiceType: record.mode ? 'ACCREC' : 'ACCPAY'
                        }
                        await quoteInvoiceDbCreators.createInvoice(tempInvoice);
                    }
                    
                });
                
                return this.sendResponse(res, this.getResponseObject(null, {}, true, 200, "Invoice updated successfully."));
            }
        } catch (err) {
            console.log('err ', err)
            return this.sendResponse(res, this.getResponseObject(null, err, false, 500, "error occured"));
        }
    }

    /**
     * @summary `Move invoice to resspective invoice type`
     * @param {any} req
     * @param {any} res
     * @memberof QuoteInvoiceController
    */
    async markAsManaged(req: any, res: any) {
        try {
            const user = await this.getSessionUser(req);
            if (!user) {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
            }

            if ('invoiceId' in req.body && 'record' in req.body) {
                const invoiceDetails = await invoiceDbGetters.getInvoiceDetails( req.body.invoiceId );
                
                const payload ={
                    invoiceId: sharedUtilService.generateUid(''),
                    provider: invoiceDetails.provider,
                    tenantId: invoiceDetails.tenantId,
                    invoiceType: invoiceDetails?.invoiceType,
                    invoiceNumber: invoiceDetails?.invoiceNumber,
                    invoiceStatus: invoiceDetails?.invoiceStatus,
                    contactName: invoiceDetails?.contactName,
                    date: invoiceDetails?.date,
                    dateDue: invoiceDetails?.dateDue,
                    total: invoiceDetails?.total,
                    currencyCode: invoiceDetails?.currencyCode,
                    currencyRate: invoiceDetails?.currencyRate,
                    type: 'unmanaged',
                    mode: invoiceDetails?.mode,
                    homeCurrencyCode: invoiceDetails?.homeCurrencyCode,
                    amountDue: 0,
                    amountPaid: 0,
                    amountCredited: 0,
                    isPricing: false
                }
                const movedRec = await hedgeInvoiceDbCreator.createInvoice(payload, true);
                

                await quoteInvoiceDbUpdaters.manage(req.body.invoiceId, req.body.record, movedRec[0]);
                return this.sendResponse(res, this.getResponseObject(null, {}, true, 200, "Invoice updated successfully."));
            }
        } catch (err) {
            console.log('err ', err)
            return this.sendResponse(res, this.getResponseObject(null, err, false, 500, "error occured"));
        }
    }

    async delete(req: any, res: any) {
        try {
            const user = await this.getSessionUser(req);
            if (!user) {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
            }

            if ('ids' in req.body) {
                quoteInvoiceDbUpdaters.delete(req.body.ids);
                return this.sendResponse(res, this.getResponseObject(null, {}, true, 200, "Invoice deleted successfully."));
            }
        } catch (err) {
            console.log('err ', err)
            return this.sendResponse(res, this.getResponseObject(null, err, false, 500, "error occured"));
        }
    }

    async clear(req: any, res: any) {
        try {
            const user = await this.getSessionUser(req);
            if (!user) {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
            }
            if ("tenantId" in req.body)
            await quoteInvoiceDbUpdaters.bulkDelete(req.body.tenantId, req.body.type, req.body.mode, req.body.currency, req.body.homeCurrencyCode);
            return this.sendResponse(res, this.getResponseObject(null, {}, true, 200, "Invoices deleted successfully."));
        } catch (err) {
            console.log('err ', err)
            return this.sendResponse(res, this.getResponseObject(null, err, false, 500, "error occured"));
        }
    }
}

export default QuoteInvoiceController;
