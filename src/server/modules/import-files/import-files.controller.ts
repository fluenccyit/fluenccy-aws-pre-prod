import { ResponseModel } from '../shared/response.model'
var csv = require("csvtojson");
import { sharedUtilService } from '@shared/common';
import { MailDataRequired } from '@sendgrid/mail';
import { importFilesDbCreators } from './import-files.db-creators';
import { importFilesDbGetters } from './import-files.db-getters';
import { importFilesDbUpdaters } from './import-files.db-updaters';
import { ImportFileDbo } from './import-files.model'
import BaseController from '../shared/base.controller'
import { authService, cookieService, dateService, DATE_TIME_FORMAT, ERROR_CODE, emailService, loggerService, SENDGRID_TEMPLATE_IDS } from '@server/common';
import { userDbGetters, userDbUpdaters } from '@server/user';
const fs = require("fs");
import { env } from 'process';
const { DOMAIN } = process.env;
import { organisationResource } from '@server/organisation';
import { GqlSupportedCurrency } from '@graphql';
import { Invoice as XeroInvoice, Payment as XeroPayment } from 'xero-node';
import { filter, find, includes, isDate, isNumber, isString, last, map } from 'lodash';
import { SUPPORTED_CURRENCIES } from '@shared/rate';
import { paymentDbCreators, paymentService } from '@server/payment';
import { invoiceDbCreators } from '@server/invoice';
//import {} from '@server/currency-score'
import { format, parse } from 'date-fns';
import { organisationDbGetters } from '@server/organisation';
import { invoiceDbGetters } from '../hedge-invoice/hedge-invoice.db-getters';
import { invoiceDbUpdaters } from '../hedge-invoice/hedge-invoice.db-updaters';
import HedgeInvoiceController from '../hedge-invoice/hedge-invoice.controller';
import { hedgeInvoiceDbCreators } from '../hedge-invoice/hedge-invoice.db-creators';
import { orgEntitlementsDbGetters } from '../org-entitlements/org-entitlements.db-getters';

export type XeroInvoiceStatus = keyof typeof XeroInvoice.StatusEnum;
export type XeroPaymentStatus = keyof typeof XeroPayment.StatusEnum;
export type XeroInvoiceType = keyof typeof XeroInvoice.TypeEnum;
export type XeroPaymentType = keyof typeof XeroPayment.PaymentTypeEnum;


export type XeroProcessedPayment = {
    provider: 'xero' | 'fluenccy';
    tenantId: string;
    paymentId: string;
    paymentStatus: XeroPaymentStatus;
    paymentType: XeroPaymentType;
    invoiceId: string;
    date: Date;
    amount: number;
    currencyRate: number;
    actualCost: number;
    import_log_id: string;
};

export type XeroProcessedInvoice = {
    provider: 'xero' | 'fluenccy';
    tenantId: string;
    invoiceId: string;
    invoiceNumber: string;
    invoiceStatus: XeroInvoiceStatus;
    invoiceType: XeroInvoiceType;
    contactName: string;
    date: Date;
    dateDue: Date;
    total: number;
    currencyCode: GqlSupportedCurrency;
    currencyRate: number;
    amountDue: number;
    amountPaid: number;
    amountCredited: number;
    import_log_id: string;
    encryptedTotal: number;
};


type ProcessAndStoreInvoicesAndPaymentsParam = {
    tenantId: string;
    orgCurrency: GqlSupportedCurrency;
    payments: XeroProcessedPayment[];
    invoices: XeroProcessedInvoice[];
};

class ImportFilesController extends BaseController {

    constructor() {
        super(__filename);
    }

    /**
     * @summary `Import CSV file and add entries to import_log tables`
     *
     * @param {any} req
     * @param {any} res
     * @memberof ImportFilesController
    */
    async importFiles(req: any, res: any) {
        //console.log('req ', req)f
        let objFile;

        try {
            objFile = req['files'][0];
            if (objFile && 'path' in objFile && 'orgId' in req.body && 'tenantId' in req.body) {
                // Async / await usage
                const jsonArray = await csv({ ignoreEmpty: true, }).fromFile(objFile.path);
                const user = await this.getSessionUser(req);
                if (!user) {
                    return this.sendResponse(res, this.getResponseObject(null, [], false, 200, 'Invalid token'));
                }

                let jsonFieldMapping: any = {};
                // console.log('json arr', jsonArray);
                if (jsonArray.length > 0) {
                    jsonFieldMapping = JSON.parse(JSON.stringify(jsonArray[0]))
                    for (var key in jsonFieldMapping) {
                        jsonFieldMapping[key] = "";
                    }
                }

                const logId = sharedUtilService.generateUid('log_');

                const objImportLog = {
                    id: logId,
                    orgId: req.body.orgId,
                    tenantId: req.body.tenantId,
                    fileType: 'CSV',
                    content: JSON.stringify(jsonArray),
                    filename: objFile.originalname,
                    field_mapping: JSON.stringify(jsonFieldMapping),
                    review_status: 'Uploaded',
                    createdBy: user?.id,
                    updatedBy: user?.id,
                };
                const isInCms = await this.isCmsRequest(req);
                if (!isInCms) {
                    const isHedging = await this.isHedgingRequest(req);
                    objImportLog.is_hedging = isHedging
                }

                if(req.body.mode) {
                    objImportLog.mode = req.body.mode;
                }

                await importFilesDbCreators.createImportFileLog(objImportLog)

                //Delete file after db insert
                if (fs.existsSync(objFile.path)) {
                    fs.unlinkSync(objFile.path)
                }

                return this.sendResponse(res, this.getResponseObject(null, [], true, 200, ""));
            } else {
                return this.sendResponse(res,
                    this.getResponseObject(null, [], false, 200, 'Invalid request'));
            }
        } catch (err) {

            //Delete file after db insert
            if (objFile && fs.existsSync(objFile.path)) {
                fs.unlinkSync(objFile.path)
            }
            console.log('err ', err)
            return this.sendResponse(res, this.getResponseObject(null, err, false, 200, "error occured"));
        }
    }

    /**
    * @summary `Return import logs`
    * @param {any} req
    * @param {any} res
    * @memberof ImportFilesController
   */
    async getImportLogs(req: any, res: any) {
        try {
            const user = await this.getSessionUser(req);
            if (!user) {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
            }

            if ('orgId' in req.body && 'tenantId' in req.body) {
                const isHedging = await this.isHedgingRequest(req);
                const isInCMS = await this.isCmsRequest(req);

                const arrRecords = await importFilesDbGetters.getImportLogs(req.body.orgId, req.body.tenantId, isHedging, isInCMS, req.body.mode ||null)
                return this.sendResponse(res, this.getResponseObject(null, arrRecords, true, 200, ""));
            } else {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 200, 'Invalid request'));
            }
        } catch (err) {
            console.log('err ', err)
            return this.sendResponse(res, this.getResponseObject(null, err, false, 500, "error occured"));
        }
    }

    /**
     * @summary `Return import log contents`
     * @param {any} req
     * @param {any} res
     * @memberof ImportFilesController
    */
    async getImportedContent(req: any, res: any) {
        try {

            if ('logId' in req.body) {
                const user = await this.getSessionUser(req);
                if (!user) {
                    return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
                }

                // to use cms log table
                const isInCMS = await this.isCmsRequest(req)

                const arrRecords = await importFilesDbGetters.getImportedContent(req.body.logId, isInCMS)

                return this.sendResponse(res, this.getResponseObject(null, arrRecords, true, 200, ""));
            } else {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 400, 'Invalid request'));
            }

        } catch (err) {
            console.log('err ', err)
            return this.sendResponse(res, this.getResponseObject(null, err, false, 500, "error occured"));
        }
    }

    /**
     * @summary `Update contents`
     * @param {any} req
     * @param {any} res
     * @memberof ImportFilesController
    */
    async updateContents(req: any, res: any) {
        try {

            if ('logId' in req.body && 'content' in req.body && 'field_mapping' in req.body && 'is_published' in req.body && 'orgId' in req.body) {
                const user = await this.getSessionUser(req);
                if (!user) {
                    return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
                }
                let arrRecords;
                let orgId = req.body.orgId;
                const isHedging = await this.isHedgingRequest(req);

                //If is_published is true then need to import all data in invoices table
                if (req.body.is_published) {
                    const objFieldMapping = req.body.field_mapping;
                    const arrInvoiceDetails = req.body.content;
                    const tenantId = req.body.tenantId;

                    let amountDue = '', // Optional
                        contactName = '', // Mandatory
                        amountCredited = '', // Optional
                        currencyCode = '', // Mandatory - invoice tbl
                        currencyRate = '', // Mandatory - invoice tbl
                        date = '', // Mandatory - invoice tbl
                        dateDue = '', // optional - invoice tbl
                        invoiceNumber = '', // Optional - invoice tbl
                        amountPaid = '', // Mandatory - invoice tbl and payment table
                        paymentCurrencyRate = '', // Mandatory
                        paymentDate = '', // Mandatory
                        invoiceId = '',
                        paymentId = '',
                        total = '', // Mandatory
                        homeCurrencyCode = '', // Optional
                        mode = '' //Optional

                    for (let key in objFieldMapping) {
                        let value = objFieldMapping[key];
                        // console.log('key: ', key, ' value: ', value);
                        if (value === 'invoiceNumber') {
                            invoiceNumber = key;
                        } else if (value === 'contactName') {
                            contactName = key;
                        } else if (value === 'date') {
                            date = key;
                        } else if (value === 'dateDue') {
                            dateDue = key;
                        } else if (value === 'total') {
                            total = key;
                            amountPaid = key;
                        } else if (value === 'currencyCode') {
                            currencyCode = key;
                        } else if (value === 'currencyRate') {
                            currencyRate = key;
                        } else if (value === 'amountDue') {
                            amountDue = key;
                        } else if (value === 'amountPaid') {
                            amountPaid = key;
                        } else if (value === 'amountCredited') {
                            amountCredited = key;
                        } else if (value === 'paymentCurrencyRate') {
                            paymentCurrencyRate = key;
                        } else if (value === 'paymentDate') {
                            paymentDate = key;
                        } else if (value === 'homeCurrencyCode') {
                            homeCurrencyCode = key;
                        }
                    }
                    // console.log('contactName:', contactName, ' date:', date, ' dateDue:', dateDue)
                    //Validate input madpping
                    let notMapped = isHedging ?
                        (contactName == '' || date == '' || total == '' || currencyCode == '' || currencyRate == '' || invoiceNumber == '') :
                        (contactName == '' || date == '' || total == '' || currencyCode == '' || currencyRate == '' || amountPaid == '' || paymentCurrencyRate == '' || paymentDate == '');
                    notMapped = isHedging && req.body.mode === 'receivables' ? notMapped || homeCurrencyCode === '' : notMapped;
                    if (notMapped) {
                        return this.sendResponse(res, this.getResponseObject(null, [], false, 200, 'Column mapping is missing for required fields.'));
                    } else {

                        let invoices: XeroProcessedInvoice[] = [];
                        let payments: XeroProcessedPayment[] = [];

                        // console.log('before parsing ', arrInvoiceDetails);
                        const isXeroConnected = !tenantId.includes("tenant_");
                        await sharedUtilService.asyncForEach(arrInvoiceDetails, async (objInvoice: any) => {
                            invoiceId = sharedUtilService.generateUid('');
                            paymentId = sharedUtilService.generateUid('');

                            const tempInvoice: XeroProcessedInvoice = {
                                tenantId: tenantId,
                                provider:  isXeroConnected ? 'xero' : 'fluenccy',
                                invoiceId: invoiceId,
                                invoiceNumber: objInvoice[invoiceNumber] ? objInvoice[invoiceNumber] : '',
                                invoiceStatus: isHedging ? (req.body.mode ? 'RECEIVABLE' : 'PAYABLE') : (req.body.mode ? 'RECEIVED' : 'PAID'),
                                invoiceType: req.body.mode ? 'ACCREC' : 'ACCPAY',
                                contactName: objInvoice[contactName] ? objInvoice[contactName] : '',
                                date: objInvoice[date] ? objInvoice[date] : '',
                                dateDue: objInvoice[dateDue] ? objInvoice[dateDue] : objInvoice[paymentDate],
                                total: objInvoice[total] ? parseFloat(objInvoice[total]) : 0,
                                currencyCode: objInvoice[currencyCode] ? objInvoice[currencyCode] : '',
                                currencyRate: objInvoice[currencyRate] ? parseFloat(objInvoice[currencyRate]) : 0,
                                amountDue: objInvoice[amountDue] ? parseFloat(objInvoice[amountDue]) : 0,
                                amountPaid: objInvoice[amountPaid] ? parseFloat(objInvoice[amountPaid]) : 0,
                                amountCredited: objInvoice[amountCredited] ? parseFloat(objInvoice[amountCredited]) : 0,
                                import_log_id: req.body.logId,
                                encryptedTotal: objInvoice['encryptedTotal'],
                            };
                            if(isHedging || (!isHedging && req.body.mode)) {
                                tempInvoice.homeCurrencyCode = objInvoice[homeCurrencyCode] ? objInvoice[homeCurrencyCode] : '';
                                tempInvoice.mode = req.body.mode ? req.body.mode : null;
                            }
                            invoices.push(tempInvoice);

                            const tempPayment: XeroProcessedPayment = {
                                provider: isXeroConnected ? 'xero' : 'fluenccy',
                                tenantId: tenantId,
                                paymentId: paymentId,
                                paymentStatus: 'AUTHORISED',
                                paymentType: req.body.mode ? 'ACCRECPAYMENT' : 'ACCPAYPAYMENT',
                                invoiceId: invoiceId,
                                date: objInvoice[paymentDate] ? objInvoice[paymentDate] : '',
                                amount: objInvoice[total] ? parseFloat(objInvoice[total]) : 0,
                                actualCost: objInvoice[amountPaid] ? parseFloat(objInvoice[amountPaid]) : 0,
                                currencyRate: objInvoice[paymentCurrencyRate] ? parseFloat(objInvoice[paymentCurrencyRate]) : 0,
                                import_log_id: req.body.logId
                            }
                            payments.push(tempPayment);

                        });

                        const organization = await organisationDbGetters.getOrganisationById(orgId);
                        const orgCurrency = organization ? organization.currency : 'NZD';
                        const orgEnts = await orgEntitlementsDbGetters.getOrgEntitlements(orgId, req.body.mode);


                        if (isHedging) {
                            await this.processAndStoreInvoicesAndPayments({ tenantId, orgCurrency: orgCurrency as GqlSupportedCurrency, payments, invoices, mode: req.body.mode }, isHedging);
                            // console.log('Invoices : ',invoices)
                            const arrPlans = req.body.mode ? [] : await invoiceDbGetters.getRecurringPlans(orgId, req.body.mode);
                            // console.log('Recurring Plans for the Organization : ',arrPlans);
                            let currPlans=[];
                            let comPlans=[];
                            
                            if(arrPlans.length!=0){
                                for(let i=0;i<arrPlans.length;i++){
                                    if(arrPlans[i].currency!=null)
                                    {
                                        currPlans.push(arrPlans[i]);
                                    }
                                    else if(arrPlans[i].company!=null){
                                        comPlans.push(arrPlans[i]);
                                    }
                                }
                            }

                            // console.log("-----------ComPlans---------",comPlans);
                            // console.log("-----------currplans---------",currPlans);

                            if(comPlans.length!=0){
                                const objHedgeInvoices = new HedgeInvoiceController();
                                for(var j=0;j<comPlans.length;j++){
                                    {
                                        for(var i=0;i<invoices.length;i++){
                                            // if((invoices[i].contactName===comPlans[j].company) && (new Date(invoices[i].date) <= new Date(comPlans[j].endDate)) && (invoices[i].total<=comPlans[j].capVolume)){
                                            if(invoices[i].contactName===comPlans[j].company){
                                                // check if end date is set
                                                if( comPlans[j].endDate != null && (new Date(invoices[i].date) > new Date(comPlans[j].endDate)) ) {
                                                    continue;
                                                }

                                                // check if end date is set
                                                if( comPlans[j].capVolume != null && (invoices[i].total > comPlans[j].capVolume)) {
                                                    continue;
                                                }
                                                var calcData = await objHedgeInvoices.getFOSPercentages(orgId,invoices[i].currencyCode, invoices[i],comPlans[j].manageType);

                                                if(comPlans[j].approvalMethod=='Notification only')
                                                {
                                                    await invoiceDbUpdaters.updateIMSInvoice(invoices[i].tenantId,invoices[i].invoiceId,comPlans[j].manageType,'managed');
                                                    await invoiceDbUpdaters.autoManageInvoice(invoices[i].tenantId,invoices[i].invoiceId);
                                                    await invoiceDbUpdaters.autoApproveInvoice(invoices[i].tenantId,invoices[i].invoiceId);
                                                    const buyingSchedule = await this.createBuyingSchedule(comPlans[j].manageType,invoices[i].invoiceId,calcData);
                                                    // var currentCost=invoices[i].total/calcData.clientSpotRate;

                                                    var currentCost = 0.00;
                                                    var targetCost = 0.00;
                                                    const calcMarginPercentage = Number(orgEnts[0].marginPercentage) / 100;
                                                    
                                                    const spotRate = calcData.clientSpotRate;
                                                    currentCost = Number(invoices[i].total * Number(calcData.forwardPercent) / 100) / (spotRate * (1 - calcMarginPercentage));
                                                    targetCost = Number(invoices[i].total * calcData.orderPercent / 100) / (calcData.clientSpotRate * (Number(calcData.forwardPercent) / 100) + ((calcData.orderPercent / 100) + (Number(calcData.spotPercent)/100)) * calcData.payable)
                                                    
                                                    await invoiceDbUpdaters.approveInvoice(invoices[i].invoiceId,currentCost,targetCost,calcData.clientSpotRate,calcData.payable);
                                                    
                                                    // await invoiceDbUpdaters.approveInvoice(invoices[i].invoiceId,currentCost,buyingSchedule.targetCost,parseFloat(calcData.clientSpotRate),parseFloat(calcData.payable));

                                                    await this.sendEmail(buyingSchedule.buyingSchedule,invoices[i].invoiceId,invoices[i].currencyCode,invoices[i].total,comPlans[j].approvalMethod);  
                                                }
                                                else if(comPlans[j].approvalMethod=='Notification and approval')
                                                {
                                                    invoiceDbUpdaters.updateIMSInvoice(invoices[i].tenantId,invoices[i].invoiceId,comPlans[j].manageType,'managed');
                                                    invoiceDbUpdaters.autoManageInvoice(invoices[i].tenantId,invoices[i].invoiceId);
                                                    const buyingSchedule = await this.createBuyingSchedule(comPlans[j].manageType,invoices[i].invoiceId,calcData);
                                                    invoiceDbUpdaters.manageInvoice(invoices[i].invoiceId,null,null,parseFloat(calcData.clientSpotRate),parseFloat(calcData.payable));
                                                    // await this.sendEmail(buyingSchedule.buyingSchedule,invoices[i].invoiceId,invoices[i].currencyCode,invoices[i].total,comPlans[j].approvalMethod);
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            if(currPlans.length!=0){
                                const objHedgeInvoices1 = new HedgeInvoiceController();
                                for(var j=0;j<currPlans.length;j++){
                                    {
                                        for(var i=0;i<invoices.length;i++){
                                            // if((invoices[i].currencyCode===currPlans[j].currency) && (new Date(invoices[i].date) <= new Date(currPlans[j].endDate)) && (invoices[i].total<=currPlans[j].capVolume)){

                                            // console.log( "---- currency code ----", invoices[i].currencyCode, " ----- ", currPlans[j].currency );
                                            if(invoices[i].currencyCode===currPlans[j].currency){
                                                // check if end date is set
                                                if( currPlans[j].endDate != null && (new Date(invoices[i].date) > new Date(currPlans[j].endDate)) ) {
                                                    continue;
                                                }

                                                // check if end date is set
                                                if( currPlans[j].capVolume != null && (invoices[i].total > currPlans[j].capVolume)) {
                                                    continue;
                                                }
                                                var calcData = await objHedgeInvoices1.getFOSPercentages(orgId,invoices[i].currencyCode,invoices[i],currPlans[j].manageType);
                                                if(currPlans[j].approvalMethod=='Notification only')
                                                {
                                                    await invoiceDbUpdaters.updateIMSInvoice(invoices[i].tenantId,invoices[i].invoiceId,currPlans[j].manageType,'managed');
                                                    await invoiceDbUpdaters.autoManageInvoice(invoices[i].tenantId,invoices[i].invoiceId);
                                                    await invoiceDbUpdaters.autoApproveInvoice(invoices[i].tenantId,invoices[i].invoiceId);
                                                    const buyingSchedule = await this.createBuyingSchedule(currPlans[j].manageType,invoices[i].invoiceId,calcData);
                                                    
                                                    var currentCost = 0.00;
                                                    const calcMarginPercentage = Number(orgEnts[0].marginPercentage) / 100;
                                                    
                                                    const spotRate = calcData.clientSpotRate;
                                                    currentCost = Number(invoices[i].total * Number(calcData.forwardPercent) / 100) / (spotRate * (1 - calcMarginPercentage));

                                                    var targetCost = Number(invoices[i].total * calcData.orderPercent / 100) / (calcData.clientSpotRate * (Number(calcData.forwardPercent) / 100) + ((calcData.orderPercent / 100) + (Number(calcData.spotPercent)/100)) * calcData.payable)
                                                    
                                                    await invoiceDbUpdaters.approveInvoice(invoices[i].invoiceId,currentCost,targetCost,calcData.clientSpotRate,calcData.payable);
                                                    
                                                    // await this.sendEmail(buyingSchedule.buyingSchedule,invoices[i].invoiceId,invoices[i].currencyCode,invoices[i].total,currPlans[j].approvalMethod);
                                                }
                                                else if(currPlans[j].approvalMethod=='Notification and approval')
                                                {
                                                    invoiceDbUpdaters.updateIMSInvoice(invoices[i].tenantId,invoices[i].invoiceId,currPlans[j].manageType,'managed');
                                                    invoiceDbUpdaters.autoManageInvoice(invoices[i].tenantId,invoices[i].invoiceId)
                                                    const buyingSchedule = await this.createBuyingSchedule(currPlans[j].manageType,invoices[i].invoiceId,calcData);

                                                    invoiceDbUpdaters.manageInvoice(invoices[i].invoiceId,null,null,parseFloat(calcData.clientSpotRate),Number(calcData.payable))
                                                    // await this.sendEmail(buyingSchedule.buyingSchedule,invoices[i].invoiceId,invoices[i].currencyCode,invoices[i].total,currPlans[j].approvalMethod);
                                                }
                                            }
                                        }
                                    }
                                }
                            }


                        } else {
                            if(!req.body.mode){
                                loggerService.info('Updating sync status of organisation to <calculatingTransactionDetails>.');
                                await organisationResource.updateOrganisation({ orgId, syncStatus: 'calculatingTransactionDetails' });
                            }
                            await this.processAndStoreInvoicesAndPayments({ tenantId, orgCurrency: orgCurrency as GqlSupportedCurrency, payments, invoices, mode: req.body.mode }, isHedging);
                            if(!req.body.mode){
                                loggerService.info('Updating sync status of organisation to <calculatingTransactionDetailsComplete>.');
                                await organisationResource.updateOrganisation({ orgId, syncStatus: 'calculatingTransactionDetailsComplete' });

                                //generating unique invoice_id
                                await organisationResource.recalculateOrganisationCurrencyScoresById(orgId);
                            }
                        }


                        //Insert in DB
                        arrRecords = await importFilesDbUpdaters.updateContent(req.body.logId, { content: JSON.stringify(req.body.content), field_mapping: JSON.stringify(req.body.field_mapping), review_status: 'Imported', updatedBy: user?.id, updated_at: new Date() });
                    }
                } else {
                    arrRecords = await importFilesDbUpdaters.updateContent(req.body.logId, { content: JSON.stringify(req.body.content), field_mapping: JSON.stringify(req.body.field_mapping), review_status: 'Draft Saved', updatedBy: user?.id, updated_at: new Date() });
                }

                return this.sendResponse(res, this.getResponseObject(null, arrRecords, true, 200, ""));
            } else {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 400, 'Invalid request'));
            }

        } catch (err) {
            // console.log("In exception");
            console.log('err ', err)
            return this.sendResponse(res, this.getResponseObject(null, err, false, 500, "error occured"));
        }
    }

     /**
     * @summary `Recalculate Score CSV`
     * @param {any} req
     * @param {any} res
     * @memberof ImportFilesController
    */
    async recalculateScore(req: any, res: any) {
        try {
            if ('orgId' in req.body) {
                const user = await this.getSessionUser(req);
                if (!user) {
                    return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
                }
                
                await organisationResource.recalculateOrganisationCurrencyScoresById(req.body.orgId);

                return this.sendResponse(res, this.getResponseObject(null, [], true, 200, "Record has been deleted successfully."));
            } else {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 400, 'Invalid request'));
            }

        } catch (err) {
            console.log('err ', err)
            return this.sendResponse(res, this.getResponseObject(null, err, false, 500, "error occured"));
        }
    }


    /**
     * @summary `Delete CSV`
     * @param {any} req
     * @param {any} res
     * @memberof ImportFilesController
    */
    async deleteCSV(req: any, res: any) {
        try {

            if ('logId' in req.body) {
                const user = await this.getSessionUser(req);
                if (!user) {
                    return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
                }

                /********* Delete files steps **********/
                // 1. Check for hedging flag
                // 2. If flag is true, delete entries from hedge_invoice table which are associated with this log entry.
                // 3. IF flag is false, delete entries from invoice and payment table which are associated with this log entry.
                // 4. Revert currency score for organization

                const { logId, isHedging, isInCMS, orgId, mode } = req.body;

                await importFilesDbUpdaters.deleteCSV(logId, isHedging, isInCMS);
                
                // Recalculate currency score
                if( !isHedging && !isInCMS && mode !== "receivables" ) await organisationResource.recalculateOrganisationCurrencyScoresById(orgId);

                return this.sendResponse(res, this.getResponseObject(null, [], true, 200, "Record has been deleted successfully."));
            } else {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 400, 'Invalid request'));
            }

        } catch (err) {
            console.log('err ', err)
            return this.sendResponse(res, this.getResponseObject(null, err, false, 500, "error occured"));
        }
    }

    async processAndStoreInvoicesAndPayments(param: ProcessAndStoreInvoicesAndPaymentsParam, isHedging: boolean = false) {
        const { tenantId, orgCurrency, payments, invoices, mode } = param;
        const logParam = { method: 'processAndStoreInvoicesAndPayments', tenantId, orgCurrency };
        const invoiceCount = invoices.length;
        const paymentCount = payments.length;
        let syncCount = 0;

        if (!invoiceCount || !paymentCount) {
            loggerService.info('No invoices or payments to process.', { ...logParam, invoiceCount, paymentCount });
            return;
        }

        loggerService.info('Processing and storing invoices and payments', { ...logParam, invoiceCount, paymentCount });

        await sharedUtilService.asyncForEach(payments, async (payment) => {
            const { paymentId } = payment;
            const invoice = find(invoices, ({ invoiceId }) => invoiceId === payment.invoiceId);

            if (!invoice?.invoiceId) {
                loggerService.info('Payment does not have a corresponding invoice. Skipping.', { ...logParam, paymentId });

                return;
            }

            const { invoiceId, currencyCode } = invoice;

            if (mode !== 'receivables' && currencyCode === orgCurrency) {
                loggerService.info('Payment is not foreign. Skipping.', { ...logParam, paymentId });
                return;
            }

            if (!includes(SUPPORTED_CURRENCIES, currencyCode)) {
                loggerService.info('Payment currency not supported. Skipping.', { ...logParam, paymentId });
                return;
            }

            try {
                if (isHedging) {
                    await Promise.all([
                        invoiceDbCreators.createInvoice(invoice, isHedging)
                    ]);
                } else {
                    const paymentCosts = await paymentService.getPaymentCosts({ baseCurrency: orgCurrency, invoice, payment });
                    await Promise.all([
                        invoiceDbCreators.createInvoice(invoice, isHedging),
                        paymentDbCreators.createPayment({ ...payment, ...paymentCosts, currencyCode: currencyCode as GqlSupportedCurrency }),
                    ]);
                }

                syncCount += 1;
            } catch (error) {
                console.log('error ', error)
                loggerService.error('Failed to process and save invoice and payment from import files', { ...logParam, paymentId, invoiceId });
            }
        });

        loggerService.info('Synced invoices and payments from import files.', { ...logParam, syncCount });
    }

    async createBuyingSchedule(manageType:any,invoiceId:any,result:any){
        var invoiceDetails = await invoiceDbGetters.getInvoiceDetails(invoiceId );
        // console.log("Calculated---------------rates")
        // console.log(result)

        var forwardPercentage = 100.00;
        var spotPercentage = 0.00;
        var orderPercentage = 0.00;

        if( manageType == 'Plan' ) {
            forwardPercentage = result.forwardPercent;
            spotPercentage = result.spotPercent;
            orderPercentage = result.orderPercent; 
        }

        // console.log("---------------- The Percentages ----------------")
        // console.log("Forward % ->  "+forwardPercentage);
        // console.log("Order %   ->  "+orderPercentage);
        // console.log("Spot %    ->  "+spotPercentage);

        const forwardValue = (parseFloat( invoiceDetails?.total * ( forwardPercentage / 100 ) )).toFixed(2);
        const spotValue = (parseFloat( invoiceDetails?.total * ( spotPercentage / 100 ) )).toFixed(2);
        const orderValue = (parseFloat( invoiceDetails?.total) - (parseFloat( forwardValue ) + parseFloat( spotValue ))).toFixed(2);
        const spotDate=invoiceDetails?.dateDue;

        let buyingSchedule = { "spotPercentage": spotPercentage, "spotValue": spotValue, "spotDate": spotDate, "orderPercentage": orderPercentage, "orderValue": orderValue, "orderDate": null, "forwardPercentage": forwardPercentage, "forwardValue": forwardValue, "forwardDate": null, "invoiceId": invoiceId, "forwardRate": parseFloat('1.25406').toFixed(5), "optimizedRate": parseFloat(result.payable).toFixed(5), "spotRate": 0.00000 };
        var targetCost=Number(invoiceDetails.total) / (result.clientSpotRate * (forwardPercentage / 100) + ((orderPercentage / 100) + (spotPercentage / 100)) * orderPercentage);
        await hedgeInvoiceDbCreators.createBuyingSchedule( buyingSchedule );
        return {buyingSchedule:buyingSchedule,targetCost:targetCost};
        
    }

    async calculateCosts(){

    }

    async sendEmail(buyingSchedule:any,invoiceId:any,currencyCode:any,amount:any,approvalMethod:any){
        //Email Details
        const resource = 'HedgeResource';
        const logParam = { resource, method: 'approving-invoice email' };
        const localEmails = [
        { 'email': 'developer@sahanisolutions.co' }
        ];
        const stageEmails = [
            { 'email': 'growth@fluenccy.com' },
            { 'email': 'sarah.bartholomeusz@fluenccy.com' },
        ];

        const localCcs = [
            { 'email': 'qa@sahanisolutions.co'},
        ];
        const stageCcs = [
            { 'email': 'sarah.bartholomeusz@fluenccy.com' },
            {'email': 'tony.crivelli@fluenccy.com'}
        ];
        var email = env.ENVIRONMENT == "local" ? localEmails : stageEmails;
        const messages: MailDataRequired[] = [];

        //Notification only

        if(approvalMethod==='Notification only'){
            const invoiceDetails = await invoiceDbGetters.getApprovedInvoiceDetails(invoiceId);
            
            
            if(invoiceDetails?.manage_type=='Plan')
            {
                var emailStr="This buying schedule has been Automatically Managed and Approved<br/><br/> "
                //Forward
                emailStr += '<table style="border:1px solid #ccc;">';
                emailStr += '<thead><tr><th style="border:1px solid #ccc;" colspan=2>Type : Forward</th></tr></thead>'
                emailStr += '<tbody><tr><td style="border:1px solid #ccc;">Supplier</td>' + '<td style="border:1px solid #ccc;">'+invoiceDetails?.contactName + '&nbsp;'+ invoiceDetails?.invoiceNumber + '</td></tr>';
                emailStr += '<tr><td style="border:1px solid #ccc;">Amount</td><td style="border:1px solid #ccc;">' + invoiceDetails?.currencyCode+'&nbsp;'+parseFloat(invoiceDetails?.buyingSchedule?.forwardValue).toFixed(2) + '</td></tr>';
                emailStr += '<tr><td style="border:1px solid #ccc;">Date</td><td style="border:1px solid #ccc;">' + invoiceDetails?.buyingSchedule.forwardDate+ '</td></tr></tbody></table><br/><br/>';

                //Order
                emailStr += '<table style="border:1px solid #ccc;">';
                emailStr += '<thead><tr><th style="border:1px solid #ccc;" colspan=2>Type : Order</th></tr></thead>'
                emailStr += '<tbody><tr><td style="border:1px solid #ccc;">Supplier</td style="border:1px solid #ccc;">' + '<td style="border:1px solid #ccc;" >'+invoiceDetails?.contactName + '&nbsp;'+ invoiceDetails?.invoiceNumber + '</td></tr>';
                emailStr += '<tr><td style="border:1px solid #ccc;">Amount</td><td style="border:1px solid #ccc;">' + invoiceDetails?.currencyCode+'&nbsp;'+parseFloat(invoiceDetails?.buyingSchedule?.orderValue).toFixed(2) + '</td></tr>';
                emailStr += '<tr><td style="border:1px solid #ccc;">Rate</td><td style="border:1px solid #ccc;">' + invoiceDetails?.buyingSchedule?.optimizedRate+ '</td></tr></tbody></table><br/><br/>';

                //Spot
                emailStr += '<table style="border:1px solid #ccc;">';
                emailStr += '<thead><tr><th style="border:1px solid #ccc;"colspan=2>Type : Spot</th></tr></thead>'
                emailStr += '<tbody><tr><td style="border:1px solid #ccc;">Supplier</td>' + '<td style="border:1px solid #ccc;">'+invoiceDetails?.contactName + '&nbsp;'+ invoiceDetails?.invoiceNumber + '</td></tr>';
                emailStr += '<tr><td style="border:1px solid #ccc;">Amount</td><td style="border:1px solid #ccc;">' + invoiceDetails?.currencyCode+'&nbsp;'+parseFloat(invoiceDetails?.buyingSchedule?.spotValue).toFixed(2) + '</td></tr>';
                emailStr += '<tr><td style="border:1px solid #ccc;">Date</td><td style="border:1px solid #ccc;">' + invoiceDetails?.dateDue+ '</td></tr></tbody></table><br/><br/>';
                            
            }
            else if(invoiceDetails?.manage_type=='Forward'){
                var emailStr="This buying schedule has been Automatically Managed and Approved<br/><br/> ";
                //Forward
                emailStr += '<table style="border:1px solid #ccc;">';
                emailStr += '<thead><tr><th style="border:1px solid #ccc;"colspan=2>Type : Forward</th></tr></thead>'
                emailStr += '<tbody><tr><td style="border:1px solid #ccc;">Supplier</td>' + '<td style="border:1px solid #ccc;">'+invoiceDetails?.contactName + '&nbsp;'+ invoiceDetails?.invoiceNumber + '</td></tr>';
                emailStr += '<tr><td style="border:1px solid #ccc;">Amount</td><td style="border:1px solid #ccc;">' + invoiceDetails?.currencyCode+'&nbsp;'+parseFloat(invoiceDetails?.buyingSchedule?.forwardValue).toFixed(2) + '</td></tr>';
                emailStr += '<tr><td style="border:1px solid #ccc;">Date</td><td style="border:1px solid #ccc;">' + invoiceDetails?.buyingSchedule.forwardDate+ '</td></tr></tbody></table><br/><br/>';

            }

        }
        else if(approvalMethod==='Notification and approval')
        {

            const invoiceDetails = await invoiceDbGetters.getInvoiceDetails(invoiceId);
            var emailStr="<b>This buying schedule has been Automatically Managed</b> <br/><br/>";

            if(invoiceDetails?.manage_type==='Plan'){
                //Forward
                emailStr += '<table style="border:1px solid #ccc;">';
                emailStr += '<thead><tr><th style="border:1px solid #ccc;" colspan=2>Type : Forward</th></tr></thead>'
                emailStr += '<tbody><tr><td style="border:1px solid #ccc;">Supplier</td>' + '<td style="border:1px solid #ccc;">'+invoiceDetails?.contactName + '&nbsp;'+ invoiceDetails?.invoiceNumber + '</td></tr>';
                emailStr += '<tr><td style="border:1px solid #ccc;">Amount</td><td style="border:1px solid #ccc;">' + invoiceDetails?.currencyCode+'&nbsp;'+parseFloat(invoiceDetails?.buyingSchedule?.forwardValue).toFixed(2) + '</td></tr>';
                emailStr += '<tr><td style="border:1px solid #ccc;">Date</td><td style="border:1px solid #ccc;">' + invoiceDetails?.buyingSchedule.forwardDate+ '</td></tr></tbody></table><br/><br/>';

                //Order
                emailStr += '<table style="border:1px solid #ccc;">';
                emailStr += '<thead><tr><th style="border:1px solid #ccc;" colspan=2>Type : Order</th></tr></thead>'
                emailStr += '<tbody><tr><td style="border:1px solid #ccc;">Supplier</td style="border:1px solid #ccc;">' + '<td style="border:1px solid #ccc;" >'+invoiceDetails?.contactName + '&nbsp;'+ invoiceDetails?.invoiceNumber + '</td></tr>';
                emailStr += '<tr><td style="border:1px solid #ccc;">Amount</td><td style="border:1px solid #ccc;">' + invoiceDetails?.currencyCode+'&nbsp;'+parseFloat(invoiceDetails?.buyingSchedule?.orderValue).toFixed(2) + '</td></tr>';
                emailStr += '<tr><td style="border:1px solid #ccc;">Rate</td><td style="border:1px solid #ccc;">' + invoiceDetails?.buyingSchedule?.optimizedRate+ '</td></tr></tbody></table><br/><br/>';

                //Spot
                emailStr += '<table style="border:1px solid #ccc;">';
                emailStr += '<thead><tr><th style="border:1px solid #ccc;"colspan=2>Type : Spot</th></tr></thead>'
                emailStr += '<tbody><tr><td style="border:1px solid #ccc;">Supplier</td>' + '<td style="border:1px solid #ccc;">'+invoiceDetails?.contactName + '&nbsp;'+ invoiceDetails?.invoiceNumber + '</td></tr>';
                emailStr += '<tr><td style="border:1px solid #ccc;">Amount</td><td style="border:1px solid #ccc;">' + invoiceDetails?.currencyCode+'&nbsp;'+parseFloat(invoiceDetails?.buyingSchedule?.spotValue).toFixed(2) + '</td></tr>';
                emailStr += '<tr><td style="border:1px solid #ccc;">Date</td><td style="border:1px solid #ccc;">' + invoiceDetails?.dateDue+ '</td></tr></tbody></table><br/><br/>';
            } 
            else if(invoiceDetails?.manage_type==='Forward'){
                //Forward
                emailStr += '<table style="border:1px solid #ccc;">';
                emailStr += '<thead><tr><th style="border:1px solid #ccc;"colspan=2>Type : Forward</th></tr></thead>'
                emailStr += '<tbody><tr><td style="border:1px solid #ccc;">Supplier</td>' + '<td style="border:1px solid #ccc;">'+invoiceDetails?.contactName + '&nbsp;'+ invoiceDetails?.invoiceNumber + '</td></tr>';
                emailStr += '<tr><td style="border:1px solid #ccc;">Amount</td><td style="border:1px solid #ccc;">' + invoiceDetails?.currencyCode+'&nbsp;'+parseFloat(invoiceDetails?.buyingSchedule?.forwardValue).toFixed(2) + '</td></tr>';
                emailStr += '<tr><td style="border:1px solid #ccc;">Date</td><td style="border:1px solid #ccc;">' + invoiceDetails?.buyingSchedule.forwardDate+ '</td></tr></tbody></table><br/><br/>';
            }

            emailStr +='<div class="btn-list">'
            emailStr +='<button style="background-color:#3DBC6A;border: none;border-radius:8px;color:white;padding: 15px 32px;text-align: center;margin: 4px 2px;cursor: pointer;">Approve Plan</button>'
            emailStr +='</div>';
        }

        loggerService.info('Preparing email.', { ...logParam, email });
        messages.push({
            to: email,
            cc: env.ENVIRONMENT == "local" ? localCcs : stageCcs,
            from: 'Fluenccy <hello@fluenccy.com>',
            templateId: SENDGRID_TEMPLATE_IDS.hedgingDetails,
            hideWarnings: true,
            subject: 'Invoice Approved',
            // @ts-ignore-next-line
            dynamic_template_data: {
                email,
                href: `${DOMAIN}`,
                hedging_details: `${emailStr}`,
                subject: 'Invoice Approved',
            },
            attachments: [],
        });
        loggerService.info('Sending invoice approving email(s).', { ...logParam, messageCount: messages.length });
        try {
            await emailService.send(messages);
        } catch (error) {
            console.log('error in sending email', error)
        }
        
        loggerService.info('Invoice Approving Email(s) sent.', logParam);
        // End of send email

    }

}

export default ImportFilesController;