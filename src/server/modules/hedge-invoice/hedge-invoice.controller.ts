import { ResponseModel } from '../shared/response.model'
var csv = require("csvtojson");
import  {map,last, groupBy} from 'lodash';
import { sharedUtilService} from '@shared/common';
import { dateService, DATE_TIME_FORMAT} from '@server/common';
import { MailDataRequired } from '@sendgrid/mail';
import { invoiceDbGetters } from './hedge-invoice.db-getters';
import { invoiceDbUpdaters } from './hedge-invoice.db-updaters';
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
import { hedgeInvoiceDbCreators } from './hedge-invoice.db-creators';
import { invoiceDbCreators } from '@server/invoice';
import { organisationDbGetters } from '@server/organisation/organisation.db-getters';
import { rateDbGetters } from '@server/rate/rate.db-getters';
import {jStat} from 'jstat';
import { Invoice as XeroInvoice, Payment as XeroPayment } from 'xero-node';
import { GqlSupportedCurrency } from '@graphql';
import { paymentDbCreators, paymentService } from '@server/payment';
import { organisationResource } from '@server/organisation';
import { OrgEntitlements } from '@client/admin';
import { entriesDbGetters } from '../cms/cms.db-getters';

export type XeroInvoiceStatus = keyof typeof XeroInvoice.StatusEnum;
export type XeroPaymentStatus = keyof typeof XeroPayment.StatusEnum;
export type XeroInvoiceType = keyof typeof XeroInvoice.TypeEnum;
export type XeroPaymentType = keyof typeof XeroPayment.PaymentTypeEnum;

const DAYS_FOR_CALCULATIONS = 365;

class HedgeInvoiceController extends BaseController {

    constructor() {
        super(__filename);
    }

    /**
     * @summary `Return Hedge Invoices`
     * @param {any} req
     * @param {any} res
     * @memberof HedgeInvoiceController
    */
    async getHedgeInvoices(req: any, res: any) {
        try {
            const user = await this.getSessionUser(req);
            if (!user) {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
            }

            if ('orgId' in req.body && 'tenantId' in req.body) {
                const arrRecords = await invoiceDbGetters.getHedgeInvoices(req.body.orgId, req.body.tenantId, req.body.currency, req.body.filter);
                const arrCurrencies = await invoiceDbGetters.getHedgeCurrencies(req.body.tenantId, req.body.orgId);
                let data = { "invoices": arrRecords, "currencies": arrCurrencies };
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
     * @memberof HedgeInvoiceController
    */
     async getInvoices(req: any, res: any) {
        try {
            const user = await this.getSessionUser(req);
            if (!user) {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
            }

            if ('orgId' in req.body && 'tenantId' in req.body && 'type' in req.body) {
                const arrRecords = await invoiceDbGetters.getInvoices(req.body.orgId, req.body.tenantId, req.body.currency, req.body.filter, req.body.type, req.body.isApproved, req.body.isPricing, req.body.view, req.body.mode, req.body.homeCurrencyCode);
                const arrCurrencies = await invoiceDbGetters.getHedgeCurrencies(req.body.tenantId, req.body.orgId, req.body.mode);
                console.log("arrCurrencies", arrCurrencies)
                let homeCurrencies = [];
                if (req.body.mode) {
                    homeCurrencies = await invoiceDbGetters.getHedgeHomeCurrencies(req.body.tenantId, req.body.orgId, req.body.mode);
                }
                const marginPercentage = await orgEntitlementsDbGetters.getMarginPercentage( req.body.orgId, req.body.mode );
                let forwardPoints: any[] = [];
                let tradeCurrencies = [];
                var baseCurrencies = [];
                // if (req.body.baseCurrency && req.body.baseCurrency != 'ALL') {
                //     baseCurrencies.push(req.body.baseCurrency);
                // }

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
     * @summary `Return fxmarket live spot rate`
     * @param req 
     * @param res
     * @memberof HedgeInvoiceController
     */

    async getLiveSpotRate(req: any, res: any) {
        const { currencyPairs } = req.body;
        const url = "https://fxmarketapi.com/apilive";
        try {
            const response = await axios
                .get(url, {
                    params: {
                        'api_key': process.env.FX_MARKET_API_KEY,
                        currency: currencyPairs
                    }
                });
            if (response.data.error) {
                return this.sendResponse(res, this.getResponseObject(null, response.data.error, false, 500, response.data.error.info));
            }
            return this.sendResponse(res, this.getResponseObject(null, response.data, true, 200, ""));
        } catch (err) {
            console.log(err)
            return this.sendResponse(res, this.getResponseObject(null, err, false, 500, "error occured"));
        }
    }

    /**
     * @summary `Update Hedge Invoices`
     * @param {any} req
     * @param {any} res
     * @memberof HedgeInvoiceController
    */
    async updateHedgeInvoices(req: any, res: any) {
        try {
            const user = await this.getSessionUser(req);
            if (!user) {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
            }

            if ('orgId' in req.body && 'tenantId' in req.body && 'bucketInvoices' in req.body && 'hedgingType' in req.body) {
                const arrRecords = await invoiceDbUpdaters.updateInvoice(req.body.orgId, req.body.tenantId, req.body.bucketInvoices, req.body.hedgingType)

                // send email through sendgrid
                const resource = 'HedgeResource';
                const logParam = { resource, method: 'hedging email' };
                const localEmails = [
                    { 'email': 'developer@sahanisolutions.co' },
                    { 'email': 'ta@sahanisolutions.co' }
                ];
                const stageEmails = [
                    { 'email': 'growth@fluenccy.com' },
                    { 'email': 'sarah.bartholomeusz@fluenccy.com' },
                ];

                const localCcs = [
                    { 'email': 'qa@sahanisolutions.co' }
                ];
                const stageCcs = [
                    { 'email': 'sarah.bartholomeusz@fluenccy.com' },
                    { 'email': 'tony.crivelli@fluenccy.com' }
                ];
                const email = env.ENVIRONMENT == "local" ? localEmails : stageEmails;
                const messages: MailDataRequired[] = [];

                var emailStr = 'This is the text for hedging details';
                emailStr = '<b>Hedging Type: ' + req.body.hedgingType + '</b>';
                emailStr += '<br/><br/><table style="border:1px solid #ccc;">';
                emailStr += '<thead style="border:1px solid #ccc;"><tr style="border:1px solid #ccc;"><th style="border:1px solid #ccc;">Invoice Number</th>';
                emailStr += '<th style="border:1px solid #ccc;">Beneficiary</th>';
                emailStr += '<th style="border:1px solid #ccc;">Payable Amount</th>';
                emailStr += '<th style="border:1px solid #ccc;">Invoice Date</th>';
                emailStr += '<th style="border:1px solid #ccc;">Due Date</th>';
                emailStr += '<th style="border:1px solid #ccc;">Amount</th>';
                emailStr += '<th style="border:1px solid #ccc;">Probability</th>';
                emailStr += '<th style="border:1px solid #ccc;">Potential Savings</th>';
                emailStr += '</tr style="border:1px solid #ccc;"></thead>';
                emailStr += '<tbody>';
                if (req.body.hedgingData.invoices.length > 0) {
                    req.body.hedgingData.invoices.forEach((inv: { invoiceNumber: string; contactName: string; currencyCode: string; total: string; date: string; dateDue: string; currencyRate: string; probability: string; pSaving: string; }) => {
                        emailStr += '<tr style="border:1px solid #ccc;">';
                        emailStr += '<td key="invoiceNumber" style="border:1px solid #ccc;">' + inv.invoiceNumber + '</td>';
                        emailStr += '<td key="contactName" style="border:1px solid #ccc;">' + inv.contactName + '</td>';
                        emailStr += '<td key="currencyCode" style="border:1px solid #ccc;">' + inv.currencyCode + ' ' + parseFloat(inv.total).toFixed(2) + '</td>';
                        emailStr += '<td key="date" style="border:1px solid #ccc;">' + inv.date + '</td>';
                        emailStr += '<td key="dateDue" style="border:1px solid #ccc;">' + inv.dateDue + '</td>';
                        emailStr += '<td key="amount" style="border:1px solid #ccc;">' + req.body.hedgingData.summary.orgCurrency + " " + (parseFloat(inv.total) / parseFloat(inv.currencyRate)).toFixed(2) + '</td>';
                        emailStr += '<td key="probability" style="border:1px solid #ccc;">' + inv.probability + '%</td>';
                        emailStr += '<td key="savings" style="border:1px solid #ccc;">' + parseFloat(inv.pSaving).toFixed(2) + '</td>';
                        emailStr += '</tr>';
                    });
                }
                emailStr += '</tbody>'
                emailStr += '</table><br/><br/>';
                emailStr += '<b>Total Amount: </b>' + req.body.hedgingData.summary.orgCurrency + " " + parseFloat(req.body.hedgingData.summary.totalAmount).toFixed(2);
                emailStr += '<br/><b>Average Probability: </b>' + parseFloat(req.body.hedgingData.summary.avgProbability).toFixed(2) + '%';
                emailStr += '<br/><b>Total Savings: </b>' + req.body.hedgingData.summary.orgCurrency + " " + parseFloat(req.body.hedgingData.summary.totalSaving).toFixed(2);

                loggerService.info('Preparing hedging email.', { ...logParam, email });
                messages.push({
                    to: email,
                    cc: env.ENVIRONMENT == "local" ? localCcs : stageCcs,
                    from: 'Fluenccy <hello@fluenccy.com>',
                    templateId: SENDGRID_TEMPLATE_IDS.hedgingDetails,
                    hideWarnings: true,
                    subject: 'Option selected to hedge your invoices is ' + req.body.hedgingType,
                    // @ts-ignore-next-line
                    dynamic_template_data: {
                        email,
                        href: `${DOMAIN}`,
                        hedging_details: `${emailStr}`,
                        subject: 'Option selected to hedge your invoices is ' + req.body.hedgingType,
                    },
                    attachments: [],
                });
                loggerService.info('Sending hedging basket email(s).', { ...logParam, messageCount: messages.length });
                try {
                    await emailService.send(messages);
                    loggerService.info('Hedging Email(s) sent.', logParam);
                } catch(error) {
                    console.log( "error in sending email" );
                }
                // End of send email

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
     * @summary `Update Unmanaged Invoice`
     * @param {any} req
     * @param {any} res
     * @memberof HedgeInvoiceController
    */
     async updateInvoice(req: any, res: any) {
        try {
            const user = await this.getSessionUser(req);
            if (!user) {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
            }

            if ('orgId' in req.body && 'tenantId' in req.body && 'invoiceId' in req.body && 'manageType' in req.body && 'type' in req.body) {
                
                var invoiceDetails = await invoiceDbGetters.getInvoiceDetails( req.body.invoiceId );

                // Check if invoice is being planned or forwarded
                if( req.body.type == "managed" ) {
                    var forwardPercentage = 100.00;
                    var spotPercentage = 0.00;
                    var orderPercentage = 0.00;

                    var result = await this.getFOSPercentages(req.body.orgId,invoiceDetails?.currencyCode, invoiceDetails, req.body.manageType);
                    if( req.body.manageType == "Plan" ) {
                        forwardPercentage = result.forwardPercent;
                        spotPercentage = result.spotPercent;
                        orderPercentage = result.orderPercent;
                    } 

                    // const orderPercentage = 100.00 - ( forwardPercentage + spotPercentage );

                    console.log("---------------- The Percentages ----------------")
                    console.log("Forward % ->  "+forwardPercentage);
                    console.log("Order %   ->  "+orderPercentage);
                    console.log("Spot %    ->  "+spotPercentage);

                    const forwardValue = (parseFloat( invoiceDetails?.total * ( forwardPercentage / 100 ) )).toFixed(2);
                    const spotValue = (parseFloat( invoiceDetails?.total * ( spotPercentage / 100 ) )).toFixed(2);
                    const orderValue = (parseFloat( invoiceDetails?.total) - (parseFloat( forwardValue ) + parseFloat( spotValue ))).toFixed(2);
                    const spotDate=invoiceDetails?.dateDue;
                    const strikeRate = req.body.strikeRate ? parseFloat(req.body.strikeRate).toFixed(5) : null;
                    const deltaRate = req.body.deltaRate ? parseFloat(req.body.deltaRate).toFixed(5) : null;

                    let buyingSchedule = { "spotPercentage": spotPercentage, "spotValue": spotValue, "spotDate": spotDate, "orderPercentage": orderPercentage, "orderValue": orderValue, "orderDate": null, "forwardPercentage": forwardPercentage, "forwardValue": forwardValue, "forwardDate": null, "invoiceId": req.body.invoiceId, "forwardRate": parseFloat(req.body.forwardRate).toFixed(5), "optimizedRate": parseFloat(req.body.optimizedRate).toFixed(5), strikeRate, deltaRate, "spotRate": 0.00000, isHedgedEverything: !!req.body.isPricing};

                    hedgeInvoiceDbCreators.createBuyingSchedule( buyingSchedule );
                }

                let arrRecords = await invoiceDbUpdaters.updateIMSInvoice(req.body.tenantId, req.body.invoiceId, req.body.manageType, req.body.type, req.body.isPricing, req.body.isGeneratedTermSheet, req.body.pricingLabelField, req.body.counterPartyEntitlementItemId);
                invoiceDetails = await invoiceDbGetters.getInvoiceDetails( req.body.invoiceId );
                const resp = { "data": arrRecords, "invoiceDetails": invoiceDetails };
                return this.sendResponse(res, this.getResponseObject(null, resp, true, 200, "Invoice updated successfully."));
            }
        } catch (err) {
            console.log('err ', err)
            return this.sendResponse(res, this.getResponseObject(null, err, false, 500, "error occured"));
        }
    }


    /**
     * @summary `Get Market Spot Rate, Calculate Client Spot Rate, Average90 and EFT`
     *          'Calculate Forward , Spot and Order Percentage'
     * @param {any} req
     * @param {any} res
     * @memberof HedgeInvoiceController
    */

    async getFOSPercentages(orgId:any,currencyCode:any, invoice:any, manageType:string){
        var org : any = await organisationDbGetters.getOrganisationById(orgId);
        var orgCurrency = org.currency;

        console.log("Fetching rates...." );
        const marketRates = await rateDbGetters.queryMarketRates(orgCurrency,currencyCode);
        var marketSpotRates = [];
        var dates = [];
        var sum = 0.00;
        var liveRate=0.00;
        var payable = 0.00;

        //Get live spot rate
        const url = "https://fxmarketapi.com/apilive";
        try {
            const response = await axios
                .get(url, {
                    params: {
                        'api_key': process.env.FX_MARKET_API_KEY,
                        currency: orgCurrency + currencyCode
                    }
                });
                console.log(response.data);
                console.log("live spot rate ", response.data.price[orgCurrency + currencyCode]);
                marketRates.splice(0,0,{"last":response.data.price[orgCurrency + currencyCode], "date":moment()});
                marketRates.join();
        }
        catch(err){
            console.log(err);
        }


        for(let i=marketRates.length-1; i>=0;i--)
        {
            marketSpotRates.push(marketRates[i].last);
            dates.push(moment(marketRates[i].date).format('YYYY-MM-DD'));
            sum = sum + marketRates[i].last;
            console.log( i, " >> ", marketRates[i].last )
        }

        //marketSpotRates.push(liveRate);

        //Dates and Rates
        console.log("Rates >>> ");
        console.log(marketSpotRates);
        console.log("Dates >>> ");
        console.log(dates);
        console.log("Length of MarketSpotRates"+marketSpotRates.length);

        //Market Spot Rate
        var marketSpotRate : any = last(marketSpotRates);

        //Average of 90 Market Rates
        var avg90 : any= ((sum) / marketSpotRates.length); 

        //EFT Calculation
        const EFT : any= ((marketSpotRate - avg90) / avg90);   

        // Fetching Organization Entitlements

        const orgEnts = await orgEntitlementsDbGetters.getOrgEntitlements(orgId, invoice?.mode || null);

        console.log("The entitlements we need >>> ");
        console.log("Forward% >>>> " + orgEnts[0].forwardPercentage);
        console.log("Spot% >>>> " + orgEnts[0].spotPercentage);
        console.log("Margin >>>> " + orgEnts[0].marginPercentage);
        console.log("HedgeAdjustment >>>> " + orgEnts[0].hedgeAdjustment);
        console.log("Max%OnOrder >>>> " + orgEnts[0].maxPercentOnOrder);
        console.log("OrderProbability >>>> " + orgEnts[0].orderProbability);

        var clientSpotRate : any = (marketSpotRate * (1-(orgEnts[0].marginPercentage/100))); 

        // Values we needed 
        console.log("Market Spot Rate >>> " + marketSpotRate);
        console.log("Client Spot Rate >>> " + clientSpotRate);
        console.log("Avg90 >>> " + avg90);
        console.log("EFT >>> " + EFT);

        var forwardPercent = 100.00;
        var orderPercent = 0.00;
        var spotPercent = 0.00;
        var orderProbability = orgEnts[0].orderProbability;

        if( manageType == "Plan") {
            var tempForward = (parseFloat(orgEnts[0].forwardPercentage / 100) + parseFloat(orgEnts[0].hedgeAdjustment * EFT));

            console.log("Temp Fwd", tempForward);
            if(parseFloat(tempForward * 100) < orgEnts[0].minForwardPercent){
                forwardPercent = parseFloat(orgEnts[0].minForwardPercent);
            }
            else{
                forwardPercent = (Math.min(orgEnts[0].maxForwardPercent,parseFloat(tempForward * 100)));
            }

            console.log("Calculated Forward Percentage: ", forwardPercent);

            orderPercent = (Math.min((orgEnts[0].maxPercentOnOrder),(100 - parseFloat(orgEnts[0].spotPercentage) - (EFT * 100) - forwardPercent)));

            console.log("Calculated Order Percentage: ", orderPercent);

            console.log("calculation", (parseFloat(forwardPercent) + parseFloat(orderPercent)));
            forwardPercent = forwardPercent.toFixed(2);
            orderPercent = orderPercent.toFixed(2);

            var sum1 = parseFloat(parseFloat(forwardPercent) + parseFloat(orderPercent));

            spotPercent = (100.00 - sum1).toFixed(2);

            console.log("Calculated Spot Percentage: ", parseFloat(spotPercent).toFixed(2));
        }

        

        if (invoice != null && manageType == "Plan") {
            const currencyPair = orgCurrency + invoice.currencyCode;
            const prob = 1 - (Number(orderProbability)/100);
            const gammaInv = Math.sqrt(jStat.gamma.inv(prob, 0.5, 1.00));

            const logs = [];
            const d = marketRates;

            for (let i = 0; i < d.length - 1; i++) {
                logs.push(Math.log(Number(d[i + 1].last) / Number(d[i].last)));
            }

            // Creating the mean with Array.reduce
            const mean = logs.reduce(function (sum, value) {
                return sum + value;
            }, 0) / logs.length;

            // Assigning (value - mean) ^ 2 to every array item
            const arr = logs.map((k) => {
                return (k - mean) ** 2;
            })

            // Calculating the sum of updated array
            const sum = arr.reduce((acc, curr) => acc + curr, 0);

            // Calculating the variance
            const variance = sum / arr.length;

            const stdDev = Math.sqrt(variance);

            const annualAdj = Math.sqrt(DAYS_FOR_CALCULATIONS) * stdDev;

            const interinCal = gammaInv * Math.sqrt(Math.PI);

            const daysToPay = Math.abs(moment(invoice.dateDue).diff(moment(), 'days'));

            payable = Math.pow((1.0000 + annualAdj), (interinCal * Math.sqrt(daysToPay / DAYS_FOR_CALCULATIONS))) * marketSpotRate;

            const F91 = marketSpotRate * (1 - (orgEnts[0].marginPercentage / 100));
            const H91 = EFT;
            const BacktestD10 = Number(orgEnts[0].minPercentAboveSpot);
            const BacktestC15 = Number(orgEnts[0].orderAdjustmentMinus) / 100;
            const K91 = annualAdj;
            const BacktestDataB4 = interinCal;
            const E95 = daysToPay;
            const BacktestC14 = Number(orgEnts[0].orderAdjustmentPlus) / 100;

            const orderAdjustment = H91 < 0 ? BacktestC15 : BacktestC14;
            const pow = Math.pow((1 + K91), ((BacktestDataB4) * Math.sqrt(E95 / DAYS_FOR_CALCULATIONS)));
            const conditionalRate = (1 + H91 * orderAdjustment) * F91 * pow;

            const maxFirst = F91 * Number(BacktestD10);

            console.log("Max First ", maxFirst);
            console.log("conditionalRate", conditionalRate);

            payable = maxFirst > conditionalRate ? maxFirst : conditionalRate;
        }

        return {
            forwardPercent,
            orderPercent,
            spotPercent,
            clientSpotRate,
            payable
        }
    }

    /**
     * @summary `Approve managed Invoice`
     * @param {any} req
     * @param {any} res
     * @memberof HedgeInvoiceController
    */
     async approveInvoice(req: any, res: any) {
        try {
            const user = await this.getSessionUser(req);
            if (!user) {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
            }

            if (req.body.isPricing) {
                let arrRecords = await invoiceDbUpdaters.approveInvoice(req.body.invoiceId,req.body.currentCost,req.body.targetCost,req.body.forwardRate,req.body.optimizedRate);
                const invoiceDetails = await invoiceDbGetters.getApprovedInvoiceDetails( req.body.invoiceId );
                const resp = { "data": arrRecords, "invoiceDetails": invoiceDetails };
                return this.sendResponse(res, this.getResponseObject(null, resp, true, 200, "Term sheet generated Successfully.")); 
            }
            //Email Details

            const resource = 'HedgeResource';
            const logParam = { resource, method: 'approving-invoice email' };

            const localCcs = [
                { 'email': 'developer@sahanisolutions.co'},
            ];
            const stageCcs = [
                { 'email': 'sarah.bartholomeusz@fluenccy.com' },
                { 'email': 'tony.crivelli@fluenccy.com' }
            ];
            // var email = env.ENVIRONMENT == "local" ? localEmails : stageEmails;
            var org : any = await organisationDbGetters.getOrganisationById(req.body.orgId);
            const orgEnts = await orgEntitlementsDbGetters.getOrgEntitlements(req.body.orgId, req.body.mode);

            console.log("Approving invoice");

            var emails = [];

            if(orgEnts[0].fi_email) {
                emails.push({'email': orgEnts[0].fi_email});
            }

            if(orgEnts[0].plan_approval_email && orgEnts[0].fi_email != orgEnts[0].plan_approval_email) {
                emails.push({'email': orgEnts[0].plan_approval_email});
            }

            const localEmails = [
                { 'email': 'developer@sahanisolutions.co' },
            ];
            const stageEmails = [
                { 'email': 'growth@fluenccy.com' },
            ];

            var email = emails.length > 0 ? emails : env.ENVIRONMENT == "local" ? localEmails : stageEmails;
            const messages: MailDataRequired[] = [];

          
            if ('orgId' in req.body && 'tenantId' in req.body && 'invoiceId' in req.body)
            {
                //Recurring Plan Approval

                // if("endDate" in req.body && "capVolume" in req.body && "approvalMethod" in req.body && ("company"  in req.body || "currency"  in req.body) && "manageType" in req.body){
                if("approvalMethod" in req.body && ("company"  in req.body || "currency"  in req.body) && "manageType" in req.body){
                    
                    console.log("Recurring Plan Approval");

                    //Notification Only
                    if(req.body.approvalMethod=='Notification only'){
                        console.log("Notification Only - send mail");
                        let arrRecords = await invoiceDbUpdaters.approveInvoice(req.body.invoiceId,req.body.currentCost,req.body.targetCost,req.body.forwardRate,req.body.optimizedRate);
                        let invoiceDetails = await invoiceDbGetters.getApprovedInvoiceDetails( req.body.invoiceId );
                        delete req.body.tenantId;
                        delete req.body.invoiceId;
                        delete req.body.currentCost;
                        delete req.body.forwardRate;
                        delete req.body.targetCost;
                        delete req.body.optimizedRate;

                        let recRecords = await hedgeInvoiceDbCreators.createRecurringPlan(req.body);
                        const resp = {"data":recRecords,"approvedInvoice":arrRecords,"invoiceDetails":invoiceDetails};

                        //Send Email

                        var emailStr = 'This is the text for approved plan';

                        //Approved Plan Details

                        emailStr = '<b>Plan Details</b><br/><br/>';
                        emailStr += '<b>Plan Type : </b>\t' + req.body.planType +'<br/>';
                        emailStr += '<b>Plan End Date : </b>\t' + req.body.endDate + '<br/>';
                        emailStr += '<b>Plan Cap Volume : </b>\t' + req.body.capVolume + '<br/>';
                        emailStr += '<b>Approval Method : </b>\t' + req.body.approvalMethod + '<br/>';
                        if(req.body.currency) emailStr += '<b>Currency : </b>\t' + req.body.currency + '<br/><br/>';
                        else emailStr += '<b>Company : </b>\t' + req.body.company + '<br/><br/>';

                        let forwardRate = resp.invoiceDetails?.buyingSchedule?.overriden ? resp.invoiceDetails?.buyingSchedule?.forwardRate : resp.invoiceDetails?.buyingSchedule?.forwardRate - (resp.invoiceDetails?.buyingSchedule?.forwardRate * (orgEnts[0].forwardMarginPercentage / 100));

                        if(req.body.manageType==='Plan'){
                            if( !invoiceDetails?.buyingSchedule.isHedgedEverything ) {
                                //Forward
                                
                                emailStr += '<table style="border:1px solid #ccc;">';
                                emailStr += '<thead><tr><th style="border:1px solid #ccc;" colspan=2>Type : Forward</th></tr></thead>'
                                emailStr += '<tbody><tr><td style="border:1px solid #ccc;">Supplier</td>' + '<td style="border:1px solid #ccc;">'+resp.invoiceDetails?.contactName + '&nbsp;'+ resp.invoiceDetails?.invoiceNumber + '</td></tr>';
                                emailStr += '<tr><td style="border:1px solid #ccc;">Amount</td><td style="border:1px solid #ccc;">' + resp.invoiceDetails?.currencyCode+'&nbsp;'+parseFloat(resp.invoiceDetails?.buyingSchedule.forwardValue).toFixed(2) + '</td></tr>';
                                emailStr += '<tr><td style="border:1px solid #ccc;">Rate</td><td style="border:1px solid #ccc;">' + forwardRate + '</td></tr>';
                                emailStr += '<tr><td style="border:1px solid #ccc;">Home Currency</td><td style="border:1px solid #ccc;">' + org.currency +'&nbsp;'+(parseFloat(resp.invoiceDetails?.buyingSchedule.forwardValue)/forwardRate).toFixed(2) + '</td></tr></tbody></table><br/><br/>';
                            }

                            //Order
                            emailStr += '<table style="border:1px solid #ccc;">';
                            emailStr += '<thead><tr><th style="border:1px solid #ccc;" colspan=2>Type : Order</th></tr></thead>'
                            emailStr += '<tbody><tr><td style="border:1px solid #ccc;">Supplier</td style="border:1px solid #ccc;">' + '<td style="border:1px solid #ccc;" >'+resp.invoiceDetails?.contactName + '&nbsp;'+ resp.invoiceDetails?.invoiceNumber + '</td></tr>';
                            
                            emailStr += '<tr><td style="border:1px solid #ccc;">Amount</td><td style="border:1px solid #ccc;">' + resp.invoiceDetails?.currencyCode+'&nbsp;'+parseFloat(invoiceDetails?.buyingSchedule.isHedgedEverything ? resp.invoiceDetails?.total : resp.invoiceDetails?.buyingSchedule.orderValue).toFixed(2) + '</td></tr>';                            
                            emailStr += '<tr><td style="border:1px solid #ccc;">Rate</td><td style="border:1px solid #ccc;">' + resp.invoiceDetails?.buyingSchedule?.optimizedRate+ '</td></tr>';
                            emailStr += '<tr><td style="border:1px solid #ccc;">Home Currency</td><td style="border:1px solid #ccc;">' + org.currency +'&nbsp;'+(parseFloat(invoiceDetails?.buyingSchedule.isHedgedEverything ? resp.invoiceDetails?.total : resp.invoiceDetails?.buyingSchedule.orderValue)/parseFloat(resp.invoiceDetails?.buyingSchedule?.optimizedRate)).toFixed(2) + '</td></tr></tbody></table><br/><br/>';

                            if( !invoiceDetails?.buyingSchedule.isHedgedEverything ) {
                                //Spot
                                emailStr += '<table style="border:1px solid #ccc;">';
                                emailStr += '<thead><tr><th style="border:1px solid #ccc;"colspan=2>Type : Spot</th></tr></thead>'
                                emailStr += '<tbody><tr><td style="border:1px solid #ccc;">Supplier</td>' + '<td style="border:1px solid #ccc;">'+resp.invoiceDetails?.contactName + '&nbsp;'+ resp.invoiceDetails?.invoiceNumber + '</td></tr>';
                                emailStr += '<tr><td style="border:1px solid #ccc;">Amount</td><td style="border:1px solid #ccc;">' + resp.invoiceDetails?.currencyCode+'&nbsp;'+parseFloat(resp.invoiceDetails?.buyingSchedule.spotValue).toFixed(2) + '</td></tr>';
                                emailStr += '<tr><td style="border:1px solid #ccc;">Date</td><td style="border:1px solid #ccc;">' + resp.invoiceDetails?.dateDue+ '</td></tr></tbody></table><br/><br/>';
                            }

                        } 
                        else if(req.body.manageType==='Forward'){
                             //Forward
                            emailStr += '<table style="border:1px solid #ccc;">';
                            emailStr += '<thead><tr><th style="border:1px solid #ccc;"colspan=2>Type : Forward</th></tr></thead>'
                            emailStr += '<tbody><tr><td style="border:1px solid #ccc;">Supplier</td>' + '<td style="border:1px solid #ccc;">'+resp.invoiceDetails?.contactName + '&nbsp;'+ resp.invoiceDetails?.invoiceNumber + '</td></tr>';
                            emailStr += '<tr><td style="border:1px solid #ccc;">Amount</td><td style="border:1px solid #ccc;">' + resp.invoiceDetails?.currencyCode+'&nbsp;'+parseFloat(resp.invoiceDetails?.buyingSchedule.forwardValue).toFixed(2) + '</td></tr>';
                            emailStr += '<tr><td style="border:1px solid #ccc;">Date</td><td style="border:1px solid #ccc;">' + resp.invoiceDetails?.buyingSchedule.forwardDate+ '</td></tr>';
                            emailStr += '<tr><td style="border:1px solid #ccc;">Rate</td><td style="border:1px solid #ccc;">' + forwardRate + '</td></tr>';
                            emailStr += '<tr><td style="border:1px solid #ccc;">Home Currency</td><td style="border:1px solid #ccc;">' + org.currency +'&nbsp;'+(parseFloat(resp.invoiceDetails?.buyingSchedule.forwardValue)/forwardRate).toFixed(2) + '</td></tr></tbody></table><br/><br/>';
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
                            loggerService.info('Invoice Approving Email(s) sent.', logParam);
                        } catch(error) {
                            console.log( "error in sending invoice approving emails" );
                        }
                        
                        
                        //End  of Email
                        return this.sendResponse(res, this.getResponseObject(null, resp, true, 200, "Invoice Approved Successfully.")); 
                    }

                    //Notification and Approval

                    else if(req.body.approvalMethod=='Notification and approval'){
                        console.log("Notification and approval");
                        let invoiceDetails=await invoiceDbGetters.getInvoiceDetails( req.body.invoiceId );
                        delete req.body.tenantId;
                        delete req.body.invoiceId;
                        let recRecords=await hedgeInvoiceDbCreators.createRecurringPlan(req.body);
                        let resp={'invoiceDetails':invoiceDetails};

                        //Email

                        var emailStr = 'This is the text for approved invoice details';

                        emailStr = '<b>Proposed Plan Details</b><br/><br/>';
                        emailStr += '<b>Plan Type : </b>\t' + req.body.planType +'<br/>';
                        emailStr += '<b>Plan End Date : </b>\t' + req.body.endDate + '<br/>';
                        emailStr += '<b>Plan Cap Volume : </b>\t' + req.body.capVolume + '<br/>';
                        emailStr += '<b>Approval Method : </b>\t' + req.body.approvalMethod + '<br/>';
                        if(req.body.currency) emailStr += '<b>Currency : </b>\t' + req.body.currency + '<br/><br/>';
                        else emailStr += '<b>Company : </b>\t' + req.body.company + '<br/><br/>';

                        let forwardRateApproval = resp.invoiceDetails?.buyingSchedule?.overriden ? resp.invoiceDetails?.buyingSchedule?.forwardRate : resp.invoiceDetails?.buyingSchedule?.forwardRate - (resp.invoiceDetails?.buyingSchedule?.forwardRate * (orgEnts[0].forwardMarginPercentage / 100));

                        if(req.body.manageType==='Plan'){
                            if( !invoiceDetails?.buyingSchedule.isHedgedEverything ) {
                                //Forward
                                emailStr += '<table style="border:1px solid #ccc;">';
                                emailStr += '<thead><tr><th style="border:1px solid #ccc;" colspan=2>Type : Forward</th></tr></thead>'
                                emailStr += '<tbody><tr><td style="border:1px solid #ccc;">Supplier</td>' + '<td style="border:1px solid #ccc;">'+resp.invoiceDetails?.contactName + '&nbsp;'+ resp.invoiceDetails?.invoiceNumber + '</td></tr>';
                                emailStr += '<tr><td style="border:1px solid #ccc;">Amount</td><td style="border:1px solid #ccc;">' + resp.invoiceDetails?.currencyCode+'&nbsp;'+parseFloat(resp.invoiceDetails?.buyingSchedule.forwardValue).toFixed(2) + '</td></tr>';
                                emailStr += '<tr><td style="border:1px solid #ccc;">Rate</td><td style="border:1px solid #ccc;">' + forwardRateApproval+ '</td></tr>';
                                emailStr += '<tr><td style="border:1px solid #ccc;">Home Currency</td><td style="border:1px solid #ccc;">' + org.currency +'&nbsp;'+(parseFloat(resp.invoiceDetails?.buyingSchedule.forwardValue)/forwardRateApproval).toFixed(2) + '</td></tr></tbody></table><br/><br/>';
                            }

                            //Order
                            emailStr += '<table style="border:1px solid #ccc;">';
                            emailStr += '<thead><tr><th style="border:1px solid #ccc;" colspan=2>Type : Order</th></tr></thead>'
                            emailStr += '<tbody><tr><td style="border:1px solid #ccc;">Supplier</td style="border:1px solid #ccc;">' + '<td style="border:1px solid #ccc;" >'+resp.invoiceDetails?.contactName + '&nbsp;'+ resp.invoiceDetails?.invoiceNumber + '</td></tr>';
                            
                            emailStr += '<tr><td style="border:1px solid #ccc;">Amount</td><td style="border:1px solid #ccc;">' + resp.invoiceDetails?.currencyCode+'&nbsp;'+parseFloat(invoiceDetails?.buyingSchedule.isHedgedEverything ? resp.invoiceDetails?.total : resp.invoiceDetails?.buyingSchedule.orderValue).toFixed(2) + '</td></tr>';

                            emailStr += '<tr><td style="border:1px solid #ccc;">Rate</td><td style="border:1px solid #ccc;">' + resp.invoiceDetails?.buyingSchedule?.optimizedRate+ '</td></tr>';

                            emailStr += '<tr><td style="border:1px solid #ccc;">Home Currency</td><td style="border:1px solid #ccc;">' + org.currency +'&nbsp;'+(parseFloat(resp.invoiceDetails?.buyingSchedule.orderValue)/parseFloat(resp.invoiceDetails?.buyingSchedule?.optimizedRate)).toFixed(2) + '</td></tr></tbody></table><br/><br/>';

                            if( !invoiceDetails?.buyingSchedule.isHedgedEverything ) {
                                //Spot
                                emailStr += '<table style="border:1px solid #ccc;">';
                                emailStr += '<thead><tr><th style="border:1px solid #ccc;"colspan=2>Type : Spot</th></tr></thead>'
                                emailStr += '<tbody><tr><td style="border:1px solid #ccc;">Supplier</td>' + '<td style="border:1px solid #ccc;">'+resp.invoiceDetails?.contactName + '&nbsp;'+ resp.invoiceDetails?.invoiceNumber + '</td></tr>';
                                emailStr += '<tr><td style="border:1px solid #ccc;">Amount</td><td style="border:1px solid #ccc;">' + resp.invoiceDetails?.currencyCode+'&nbsp;'+parseFloat(resp.invoiceDetails?.buyingSchedule.spotValue).toFixed(2) + '</td></tr>';
                                emailStr += '<tr><td style="border:1px solid #ccc;">Date</td><td style="border:1px solid #ccc;">' + resp.invoiceDetails?.dateDue+ '</td></tr></tbody></table><br/><br/>';
                            }

                        } 
                        else if(req.body.manageType==='Forward'){
                           //Forward
                            emailStr += '<table style="border:1px solid #ccc;">';
                            emailStr += '<thead><tr><th style="border:1px solid #ccc;"colspan=2>Type : Forward</th></tr></thead>'
                            emailStr += '<tbody><tr><td style="border:1px solid #ccc;">Supplier</td>' + '<td style="border:1px solid #ccc;">'+resp.invoiceDetails?.contactName + '&nbsp;'+ resp.invoiceDetails?.invoiceNumber + '</td></tr>';
                            emailStr += '<tr><td style="border:1px solid #ccc;">Amount</td><td style="border:1px solid #ccc;">' + resp.invoiceDetails?.currencyCode+'&nbsp;'+parseFloat(resp.invoiceDetails?.buyingSchedule.forwardValue).toFixed(2) + '</td></tr>';
                            emailStr += '<tr><td style="border:1px solid #ccc;">Date</td><td style="border:1px solid #ccc;">' + resp.invoiceDetails?.buyingSchedule.forwardDate+ '</td></tr></tbody></table><br/><br/>';
                            emailStr += '<tr><td style="border:1px solid #ccc;">Rate</td><td style="border:1px solid #ccc;">' + forwardRateApproval + '</td></tr>';
                            emailStr += '<tr><td style="border:1px solid #ccc;">Home Currency</td><td style="border:1px solid #ccc;">' + org.currency +'&nbsp;'+(parseFloat(resp.invoiceDetails?.buyingSchedule.forwardValue)/forwardRateApproval).toFixed(2) + '</td></tr></tbody></table><br/><br/>';
                        }

                        
                        emailStr +='<div class="btn-list">'
                        emailStr +='<button style="background-color:#3DBC6A;border: none;border-radius:8px;color:white;padding: 15px 32px;text-align: center;margin: 4px 2px;cursor: pointer;">Approve Plan</button>'
                        emailStr +='</div>';
    
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
                            loggerService.info('Invoice Approving Email(s) sent.', logParam);
                        } catch (error) {
                            console.log( "error in sending approve email" );
                        }
                        // End of send email

                        return this.sendResponse(res, this.getResponseObject(null, resp, true, 200, "Invoice Approved Successfully.")); 
                    }  
                }

                //Non Recurring Plan

                else{
                    console.log("Simple Approval")
                    let arrRecords = await invoiceDbUpdaters.approveInvoice(req.body.invoiceId, req.body.currentCost, req.body.targetCost, req.body.forwardRate, req.body.optimizedRate);
                    const invoiceDetails = await invoiceDbGetters.getApprovedInvoiceDetails( req.body.invoiceId );
                    const resp = { "data": arrRecords, "invoiceDetails": invoiceDetails };
                    const entitlements = await orgEntitlementsDbGetters.getOrgEntitlements(req.body.orgId, req.body.mode);

                    var orgName = await organisationDbGetters.getOrganisationById(req.body.orgId);
                    var emailStr="Order for "+resp.invoiceDetails?.invoiceNumber+", for "+orgName?.name+"<br/><br/>";

                    let forwardRateSimple = resp.invoiceDetails?.buyingSchedule?.overriden ? resp.invoiceDetails?.buyingSchedule?.forwardRate : resp.invoiceDetails?.buyingSchedule?.forwardRate - (resp.invoiceDetails?.buyingSchedule?.forwardRate * (orgEnts[0].forwardMarginPercentage / 100));

                    if(invoiceDetails?.manage_type=='Plan')
                    {

                        if( !invoiceDetails?.buyingSchedule.isHedgedEverything ) {
                            //Forward
                            emailStr += '<table style="border:1px solid #ccc;">';
                            emailStr += '<thead><tr><th style="border:1px solid #ccc;" colspan=2>Type : Forward</th></tr></thead>'
                            emailStr += '<tbody><tr><td style="border:1px solid #ccc;">Supplier</td>' + '<td style="border:1px solid #ccc;">'+resp.invoiceDetails?.contactName + '&nbsp;'+ resp.invoiceDetails?.invoiceNumber + '</td></tr>';
                            emailStr += '<tr><td style="border:1px solid #ccc;">Amount</td><td style="border:1px solid #ccc;">' + resp.invoiceDetails?.currencyCode+'&nbsp;'+parseFloat(resp.invoiceDetails?.buyingSchedule.forwardValue).toFixed(2) + '</td></tr>';
                            emailStr += '<tr><td style="border:1px solid #ccc;">Date</td><td style="border:1px solid #ccc;">' + resp.invoiceDetails?.buyingSchedule.forwardDate+ '</td></tr>';
                            emailStr += '<tr><td style="border:1px solid #ccc;">Rate</td><td style="border:1px solid #ccc;">' + forwardRateSimple + '</td></tr>';
                            emailStr += '<tr><td style="border:1px solid #ccc;">Home Currency</td><td style="border:1px solid #ccc;">' + org.currency +'&nbsp;'+(parseFloat(resp.invoiceDetails?.buyingSchedule.forwardValue)/forwardRateSimple).toFixed(2) + '</td></tr></tbody></table><br/><br/>';
                        }

                        //Order
                        emailStr += '<table style="border:1px solid #ccc;">';
                        emailStr += '<thead><tr><th style="border:1px solid #ccc;" colspan=2>Type : Order</th></tr></thead>'
                        emailStr += '<tbody><tr><td style="border:1px solid #ccc;">Supplier</td style="border:1px solid #ccc;">' + '<td style="border:1px solid #ccc;" >'+resp.invoiceDetails?.contactName + '&nbsp;'+ resp.invoiceDetails?.invoiceNumber + '</td></tr>';
                        emailStr += '<tr><td style="border:1px solid #ccc;">Amount</td><td style="border:1px solid #ccc;">' + resp.invoiceDetails?.currencyCode+'&nbsp;'+parseFloat(invoiceDetails?.buyingSchedule.isHedgedEverything ? resp.invoiceDetails?.total : resp.invoiceDetails?.buyingSchedule.orderValue).toFixed(2) + '</td></tr>';
                        emailStr += '<tr><td style="border:1px solid #ccc;">Rate</td><td style="border:1px solid #ccc;">' + resp.invoiceDetails?.buyingSchedule?.optimizedRate+ '</td></tr>';
                        emailStr += '<tr><td style="border:1px solid #ccc;">Home Currency</td><td style="border:1px solid #ccc;">' + org.currency +'&nbsp;'+(parseFloat(invoiceDetails?.buyingSchedule.isHedgedEverything ? resp.invoiceDetails?.total : resp.invoiceDetails?.buyingSchedule.orderValue)/parseFloat(resp.invoiceDetails?.buyingSchedule?.optimizedRate)).toFixed(2) + '</td></tr></tbody></table><br/><br/>';

                        if( !invoiceDetails?.buyingSchedule.isHedgedEverything ) {
                            //Spot
                            emailStr += '<table style="border:1px solid #ccc;">';
                            emailStr += '<thead><tr><th style="border:1px solid #ccc;"colspan=2>Type : Spot</th></tr></thead>'
                            emailStr += '<tbody><tr><td style="border:1px solid #ccc;">Supplier</td>' + '<td style="border:1px solid #ccc;">'+resp.invoiceDetails?.contactName + '&nbsp;'+ resp.invoiceDetails?.invoiceNumber + '</td></tr>';
                            emailStr += '<tr><td style="border:1px solid #ccc;">Amount</td><td style="border:1px solid #ccc;">' + resp.invoiceDetails?.currencyCode+'&nbsp;'+parseFloat(resp.invoiceDetails?.buyingSchedule.spotValue).toFixed(2) + '</td></tr>';
                            emailStr += '<tr><td style="border:1px solid #ccc;">Date</td><td style="border:1px solid #ccc;">' + resp.invoiceDetails?.dateDue+ '</td></tr></tbody></table><br/><br/>';
                        }
                        
                    }
                    else if(invoiceDetails?.manage_type=='Forward'){
                        //Forward
                        emailStr += '<table style="border:1px solid #ccc;">';
                        emailStr += '<thead><tr><th style="border:1px solid #ccc;"colspan=2>Type : Forward</th></tr></thead>'
                        emailStr += '<tbody><tr><td style="border:1px solid #ccc;">Supplier</td>' + '<td style="border:1px solid #ccc;">'+resp.invoiceDetails?.contactName + '&nbsp;'+ resp.invoiceDetails?.invoiceNumber + '</td></tr>';
                        emailStr += '<tr><td style="border:1px solid #ccc;">Amount</td><td style="border:1px solid #ccc;">' + resp.invoiceDetails?.currencyCode+'&nbsp;'+parseFloat(resp.invoiceDetails?.buyingSchedule.forwardValue).toFixed(2) + '</td></tr>';
                        emailStr += '<tr><td style="border:1px solid #ccc;">Date</td><td style="border:1px solid #ccc;">' + resp.invoiceDetails?.buyingSchedule.forwardDate+ '</td></tr>';
                        emailStr += '<tr><td style="border:1px solid #ccc;">Rate</td><td style="border:1px solid #ccc;">' + forwardRateSimple + '</td></tr></tbody></table><br/><br/>';
                        emailStr += '<tr><td style="border:1px solid #ccc;">Home Currency</td><td style="border:1px solid #ccc;">' + org.currency +'&nbsp;'+(parseFloat(resp.invoiceDetails?.buyingSchedule.forwardValue)/forwardRateSimple).toFixed(2) + '</td></tr></tbody></table><br/><br/>';
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
                        loggerService.info('Invoice Approving Email(s) sent.', logParam);
                    } catch (error) {
                        console.log( "error in sending approving emails" );
                        console.log(error);
                    }
                    
                    // End of send email

                    return this.sendResponse(res, this.getResponseObject(null, resp, true, 200, "Invoice Approved Successfully.")); 
                }
                
            }
        } catch (err) {
            console.log('err ', err)
            return this.sendResponse(res, this.getResponseObject(null, err, false, 500, "error occured"));
        }
    }


    /**
     * @summary `Return Recurring Plans`
     * @param {any} req
     * @param {any} res
     * @memberof HedgeInvoiceController
    */
     async getRecurringPlans(req: any, res: any) {
        try {
            const user = await this.getSessionUser(req);
            if (!user) {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
            }

            if ('orgId' in req.body) {
                const arrRecords = await invoiceDbGetters.getRecurringPlans(req.body.orgId, req.body.mode);
                let data = { "plans": arrRecords};
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
     * @summary `Delete Recurring plan`
     * @param {any} req
     * @param {any} res
     * @memberof HedgeInvoiceController
    */
     async deleteRecurringPlan(req: any, res: any) {
        try {

            if ('logId' in req.body) {
                const user = await this.getSessionUser(req);
                if (!user) {
                    return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
                }

                await invoiceDbUpdaters.deleteRecurringPlan(req.body.logId);

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
     * @summary `Update Recurring plan`
     * @param {any} req
     * @param {any} res
     * @memberof HedgeInvoiceController
    */
      async updateRecurringPlan(req: any, res: any) {
        try {

            if ('logId' in req.body && 'endDate' in req.body && 'capVolume' in req.body && 'approvalMethod' in req.body) {
                const user = await this.getSessionUser(req);
                if (!user) {
                    return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
                }
                console.log(req.body)
                await invoiceDbUpdaters.updateRecurringPlan(req.body.logId,req.body.endDate,req.body.capVolume,req.body.approvalMethod);

                return this.sendResponse(res, this.getResponseObject(null, [], true, 200, "Record has been updated successfully."));
            } else {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 400, 'Invalid request'));
            }

        } catch (err) {
            console.log('err ', err)
            return this.sendResponse(res, this.getResponseObject(null, err, false, 500, "error occured"));
        }
    }

    /**
     * @summary `Update Recurring plan`
     * @param {any} req
     * @param {any} res
     * @memberof HedgeInvoiceController
    */

    async updateBuyingSchedule(req: any, res: any) {
        try {

            if ('invoiceId' in req.body) {
                const user = await this.getSessionUser(req);
                if (!user) {
                    return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
                }
                const payload = {...req.body};
                const {invoiceId} = payload
                delete payload.invoiceId;
                delete payload.orgId;
                delete payload.tenantId;
                if( payload.optimisedRate || payload.optimisedRate == 0 ) delete payload.optimisedRate;
                console.log("updateBuyingSchedule", payload)
                await invoiceDbUpdaters.updateBuyingSchedule(invoiceId, payload);
                const invoiceDetails = await invoiceDbGetters.getInvoiceDetails(invoiceId);
                return this.sendResponse(res, this.getResponseObject(null, invoiceDetails, true, 200, "Record has been updated successfully."));
            } else {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 400, 'Invalid request'));
            }

        } catch (err) {
            console.log('err ', err)
            return this.sendResponse(res, this.getResponseObject(null, err, false, 500, "error occured"));
        }
    }

    /**
     * @summary `Update Recurring plan`
     * @param {any} req
     * @param {any} res
     * @memberof HedgeInvoiceController
    */

    async markAsPaidAndReceived(req: any, res: any) {
        try {
    
            if ('invoiceId' in req.body) {
                const user = await this.getSessionUser(req);
                if (!user) {
                    return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
                }

                // let hedgeInvoiceDetails = invoiceDbGetters.getInvoices(orgId)
                // 1. Get hedge invoice
                // 2. Create entry in invoice table
                // 3. Get newly created invoice id
                // 4. Get min rate and max rate from rates table for executed date
                // 5. Calculate costs based on min rate/max rate/ actual amount
                // 6. Make entries in payments table
                // 7. Calculate currency score
                // 8. Mark invoice as paid

                // 1. Get hedge invoice
                var hedgeInvoiceDetails = await invoiceDbGetters.getInvoiceDetails( req.body.invoiceId );
                const isXeroConnected = !req.body.tenantId.includes("tenant_");
                if( hedgeInvoiceDetails ) {
                    // if (hedgeInvoiceDetails.mode === 'receivables') {
                    //     await invoiceDbUpdaters.markAsReceived(req.body.invoiceId);
                    //     return this.sendResponse(res, this.getResponseObject(null, [], true, 200, "Invoice has been marked as received successfully."));
                    // }

                    // Check if hege invoice is executed

                    // 2. Create entry in invoice table
                    let invoiceId = sharedUtilService.generateUid('');

                    const tempInvoice: XeroProcessedInvoice = {
                        tenantId: req.body.tenantId,
                        provider: isXeroConnected ? 'xero' : 'fluenccy',
                        invoiceId: invoiceId,
                        invoiceNumber: hedgeInvoiceDetails.invoiceNumber,
                        invoiceStatus: hedgeInvoiceDetails.mode === 'receivables' ? 'RECEIVED' : 'PAID',
                        invoiceType: hedgeInvoiceDetails.mode === 'receivables' ? 'ACCREC' : 'ACCPAY',
                        contactName: hedgeInvoiceDetails.contactName,
                        date: hedgeInvoiceDetails.date,
                        dateDue: hedgeInvoiceDetails.dateDue,
                        total: Number(hedgeInvoiceDetails.total),
                        currencyCode: hedgeInvoiceDetails.currencyCode,
                        currencyRate: hedgeInvoiceDetails.currencyRate,
                        amountDue: hedgeInvoiceDetails.amountDue,
                        amountPaid: hedgeInvoiceDetails.total,
                        amountCredited: 0,
                        import_log_id: hedgeInvoiceDetails.import_log_id
                    };
                    console.log(tempInvoice);
                    const orgId = req.body.orgId
                    await organisationResource.updateOrganisation({ orgId, syncStatus: 'calculatingTransactionDetails' });
                    await invoiceDbCreators.createInvoice(tempInvoice, false);
                    console.log( "Invoice created" );

                    //don't need to create invoices record and paymentrecord for receivables invoices
                    // if (hedgeInvoiceDetails.mode === 'receivables') {
                    //     await invoiceDbUpdaters.markAsReceived(req.body.invoiceId);
                    //     return this.sendResponse(res, this.getResponseObject(null, [], true, 200, "Invoice has been marked as received successfully."));
                    // } else {
                        console.log( "Creating payments" );
                        // 6. Make entries in payments table
                        // create payments
                        let paymentIdFwd = sharedUtilService.generateUid('');
                        var actualCost = 0;
                        if( hedgeInvoiceDetails.manage_type == "Plan") {
                            if( hedgeInvoiceDetails.buyingSchedule.isHedgedEverything ) {
                                actualCost = (Number(hedgeInvoiceDetails.buyingSchedule.executedForwardValue) / Number(hedgeInvoiceDetails.buyingSchedule.executedForwardRate));
                            } else {
                                actualCost = (Number(hedgeInvoiceDetails.buyingSchedule.executedForwardValue) / Number(hedgeInvoiceDetails.buyingSchedule.executedForwardRate)) + (Number(hedgeInvoiceDetails.buyingSchedule.executedOrderValue) / Number(hedgeInvoiceDetails.buyingSchedule.executedOrderRate)) + (Number(hedgeInvoiceDetails.buyingSchedule.executedSpotValue) / Number(hedgeInvoiceDetails.buyingSchedule.executedSpotRate));
                            }
                            
                        } else {
                            actualCost = Number(hedgeInvoiceDetails.buyingSchedule.executedForwardValue) / Number(hedgeInvoiceDetails.buyingSchedule.executedForwardRate);
                        }
                        

                        debugger;
                        let actualRate = Number(hedgeInvoiceDetails.total) / actualCost;
                        console.log("actual cost", actualCost);
                        console.log("actual rate", actualRate);

                        const tempPaymentFwd: XeroProcessedPayment = {
                            provider: isXeroConnected ? 'xero' : 'fluenccy',
                            tenantId: req.body.tenantId,
                            paymentId: paymentIdFwd,
                            paymentStatus: 'AUTHORISED',
                            paymentType: hedgeInvoiceDetails.mode === 'receivables' ? 'ACCRECPAYMENT' : 'ACCPAYPAYMENT',
                            invoiceId: invoiceId,
                            date: hedgeInvoiceDetails.buyingSchedule.executedForwardDate,
                            // amount: hedgeInvoiceDetails.buyingSchedule.executedForwardValue,
                            amount: Number(hedgeInvoiceDetails.total),
                            // actualCost: hedgeInvoiceDetails.buyingSchedule.executedForwardValue / hedgeInvoiceDetails.buyingSchedule.executedForwardRate,
                            actualCost: actualCost,
                            // currencyRate: hedgeInvoiceDetails.buyingSchedule.executedForwardRate,
                            currencyRate: actualRate,
                            import_log_id: hedgeInvoiceDetails.import_log_id
                        }

                        let paymentIdOrder = sharedUtilService.generateUid('');
                        const tempPaymentOrder: XeroProcessedPayment = {
                            provider: isXeroConnected ? 'xero' : 'fluenccy',
                            tenantId: req.body.tenantId,
                            paymentId: paymentIdOrder,
                            paymentStatus: 'AUTHORISED',
                            paymentType: hedgeInvoiceDetails.mode === 'receivables' ? 'ACCRECPAYMENT' : 'ACCPAYPAYMENT',
                            invoiceId: invoiceId,
                            date: hedgeInvoiceDetails.buyingSchedule.executedOrderDate,
                            amount: hedgeInvoiceDetails.buyingSchedule.executedOrderValue,
                            actualCost: hedgeInvoiceDetails.buyingSchedule.executedOrderValue / hedgeInvoiceDetails.buyingSchedule.executedOrderRate,
                            currencyRate: hedgeInvoiceDetails.buyingSchedule.executedOrderRate,
                            import_log_id: hedgeInvoiceDetails.import_log_id
                        }

                        let paymentIdSpot = sharedUtilService.generateUid('');
                        const tempPaymentSpot: XeroProcessedPayment = {
                            provider: isXeroConnected ? 'xero' : 'fluenccy',
                            tenantId: req.body.tenantId,
                            paymentId: paymentIdSpot,
                            paymentStatus: 'AUTHORISED',
                            paymentType: hedgeInvoiceDetails.mode === 'receivables' ? 'ACCRECPAYMENT' : 'ACCPAYPAYMENT',
                            invoiceId: invoiceId,
                            date: hedgeInvoiceDetails.buyingSchedule.executedSpotDate,
                            amount: hedgeInvoiceDetails.buyingSchedule.executedSpotValue,
                            actualCost: hedgeInvoiceDetails.buyingSchedule.executedSpotValue / hedgeInvoiceDetails.buyingSchedule.executedSpotRate,
                            currencyRate: hedgeInvoiceDetails.buyingSchedule.executedSpotRate,
                            import_log_id: hedgeInvoiceDetails.import_log_id
                        }

                        // Create payment entries
                        // 4. Get min rate and max rate from rates table for executed date
                        // 5. Calculate costs based on min rate/max rate/ actual amount
                        const organization = await organisationDbGetters.getOrganisationById(req.body.orgId);
                        const orgCurrency = organization ? organization.currency : 'NZD';
                        const { currencyCode } = tempInvoice;
                        const invoice = tempInvoice;
                        var payment = tempPaymentFwd;
                        const paymentCostsFwd = await paymentService.getPaymentCosts({ baseCurrency: orgCurrency as GqlSupportedCurrency, invoice, payment });
                        // payment = tempPaymentOrder;
                        // const paymentCostsOrder = await paymentService.getPaymentCosts({ baseCurrency: orgCurrency as GqlSupportedCurrency, invoice, payment });
                        // payment = tempPaymentSpot;
                        // const paymentCostsSpot = await paymentService.getPaymentCosts({ baseCurrency: orgCurrency as GqlSupportedCurrency, invoice, payment });
                        await Promise.all([
                            paymentDbCreators.createPayment({ ...tempPaymentFwd, ...paymentCostsFwd, currencyCode: currencyCode as GqlSupportedCurrency }),
                            // paymentDbCreators.createPayment({ ...tempPaymentOrder, ...paymentCostsOrder, currencyCode: currencyCode as GqlSupportedCurrency }),
                            // paymentDbCreators.createPayment({ ...tempPaymentSpot, ...paymentCostsSpot, currencyCode: currencyCode as GqlSupportedCurrency }),
                        ]);
                        console.log( " payments created successfully" );
                        await organisationResource.updateOrganisation({ orgId, syncStatus: 'calculatingTransactionDetailsComplete' });

                        // 8. Mark invoice as paid or received
                        if( hedgeInvoiceDetails.mode === 'receivables' ) {
                            await invoiceDbUpdaters.markAsReceived(req.body.invoiceId);
                            return this.sendResponse(res, this.getResponseObject(null, [], true, 200, "Invoice has been marked as received successfully."));
                        } else {
                             await invoiceDbUpdaters.markAsPaidAndReceived(req.body.invoiceId);
                            console.log( "invoice marked as paid successfully" );

                            // 7. Calculate currency score
                            console.log( "starting currency score calculation worker" );
                            await organisationResource.recalculateOrganisationCurrencyScoresById(orgId);
                            console.log( "Currency score calculated" );
                            return this.sendResponse(res, this.getResponseObject(null, [], true, 200, "Invoice has been marked as paid successfully."));
                        }
                       
                    // }
    
                } else {
                    return this.sendResponse(res, this.getResponseObject(null, [], false, 400, 'Hedge invoice details not found.'));
                }
            } else {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 400, 'Invalid request'));
            }
    
        } catch (err) {
            console.log('err ', err)
            return this.sendResponse(res, this.getResponseObject(null, err, false, 500, "error occured"));
        }
    }

    formatNumber(number, n, x) {
        var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
        return number?.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,') || 0.00;
    };

    async generateTermSheet(req: any, res: any) {
        try {
            const user = await this.getSessionUser(req);
            if (!user) {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
            }
            const resource = 'Term sheet generate';
            const logParam = { resource, method: 'term sheet email' };
            const localCcs = [
                { 'email': 'developer@sahanisolutions.co'},
            ];
            const stageCcs = [
                { 'email': 'sarah.bartholomeusz@fluenccy.com' },
                { 'email': 'tony.crivelli@fluenccy.com' }
            ];
            const crmEntitlements= await orgEntitlementsDbGetters.getOrgCmsEntitlements(req.body.orgId, true, req.body.mode);
            const orgEnts = await orgEntitlementsDbGetters.getOrgEntitlements(req.body.orgId, req.body.mode);
            const org : any = await organisationDbGetters.getOrganisationById(req.body.orgId);
            var emails = [];

            if(orgEnts[0].fi_email) {
                emails.push({'email': orgEnts[0].fi_email});
            }

            if(orgEnts[0].plan_approval_email && orgEnts[0].fi_email != orgEnts[0].plan_approval_email) {
                emails.push({'email': orgEnts[0].plan_approval_email});
            }

            const localEmails = [
                { 'email': 'developer@sahanisolutions.co' },
            ];
            const stageEmails = [
                { 'email': 'growth@fluenccy.com' },
            ];

            var email = emails.length > 0 ? emails : env.ENVIRONMENT == "local" ? localEmails : stageEmails;
            const messages: MailDataRequired[] = [];
            if ('orgId' in req.body && 'invoiceId' in req.body && 'tenantId' in req.body) {
                // generate term sheet and send email
                const invoiceDetails = await invoiceDbGetters.getInvoiceDetails( req.body.invoiceId );
                const {buyingSchedule, total, manage_type, pricingLabelField, contactName, currencyCode} = invoiceDetails;
                const pricingLabelFieldValue = crmEntitlements[0]?.[`pricingOption${pricingLabelField}Label`] || `Option ${pricingLabelField}`;
                const rate = manage_type === 'Plan' ? buyingSchedule.optimizedRate : buyingSchedule.forwardRate;
                var emailStr = `<div style="margin:auto;width:fit-content">`;
                emailStr += `<table>`;
                emailStr += `<tr><td colspan="2" style="border:1px solid gray">Type : Options Pricing</td></tr>`;
                emailStr += `<tr><td style="border:1px solid gray">Product Name</td><td style="border:1px solid gray">${pricingLabelFieldValue}</td></tr>`;
                emailStr += `<tr><td style="border:1px solid gray">Rate</td><td style="border:1px solid gray"> ${rate}</td></tr>`;
                emailStr += `<tr><td style="border:1px solid gray">Strike</td><td style="border:1px solid gray"> ${buyingSchedule.strikeRate}</td></tr>`;
                emailStr += `<tr><td style="border:1px solid gray">FX CCY Amount</td><td style="border:1px solid gray"> ${currencyCode} ${this.formatNumber(Number(total), 2, 3)}</td></tr>`;
                emailStr += `<tr><td style="border:1px solid gray">Home CCY Amount</td><td style="border:1px solid gray"> ${org.currency} ${this.formatNumber(Number(total / rate), 2, 3)}</td></tr>`;
                emailStr += `<tr><td style="border:1px solid gray">Due Date</td><td style="border:1px solid gray"> ${moment(invoiceDetails?.dateDue).format('DD-MMM-YY')}</td></tr>`;
                
                emailStr += `</table></div><br/>`;
                
                loggerService.info('Preparing email.', { ...logParam, email });
                messages.push({
                    to: email,
                    cc: env.ENVIRONMENT == "local" ? localCcs : stageCcs,
                    from: 'Fluenccy <hello@fluenccy.com>',
                    templateId: SENDGRID_TEMPLATE_IDS.termsheetEmail,
                    hideWarnings: true,
                    subject: `Term Sheeet Generated for ${contactName}`,
                    // @ts-ignore-next-line
                    dynamic_template_data: {
                        email,
                        href: `${DOMAIN}`,
                        user_name: `${user.firstName}`,
                        termsheet: `${emailStr}`,
                        subject: `Term Sheeet Generated for ${contactName}`,
                    },
                    attachments: [],
                });
                loggerService.info('Sending Term sheet email(s).', { ...logParam, messageCount: messages.length });
                console.log( "Sending term sheet email....", logParam );
                try {
                    await emailService.send(messages);
                    loggerService.info('Term sheet Email(s) sent.', logParam);
                } catch (error) {
                    console.log( "error in sending Term sheet email", error );
                }
                return this.sendResponse(res, this.getResponseObject(null, {generated:true}, true, 200, ""));
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
     * @memberof HedgeInvoiceController
    */
    async getArchivedInvoices(req: any, res: any) {
        try {
            const user = await this.getSessionUser(req);
            if (!user) {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
            }

            if ('orgId' in req.body && 'tenantId' in req.body) {
                const arrRecords = await invoiceDbGetters.getArchivedInvoices(req.body.orgId, req.body.tenantId, req.body.currency, req.body.filter, req.body.mode, req.body.isPricing);
                
                let data = { "invoices": arrRecords };
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
};

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

export default HedgeInvoiceController;
