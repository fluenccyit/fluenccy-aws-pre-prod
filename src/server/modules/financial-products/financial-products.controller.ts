import { ResponseModel } from '../shared/response.model'
var csv = require("csvtojson");
import { sharedUtilService } from '@shared/common';
import { MailDataRequired } from '@sendgrid/mail';
import { financialProductsDbCreator } from './financial-products.db-creators';
import { financialProductsDbGetter } from './financial-products.db-getters';
import { financialProductsDbUpdater } from './financial-products.db-updaters';
import { financialProductsDbDeleter } from './financial-products.db-deleters';
import { emailService, loggerService, SENDGRID_TEMPLATE_IDS } from '@server/common';
const { DOMAIN } = process.env;
import BaseController from '../shared/base.controller'
import { from } from '@apollo/client';
import { env } from 'process';
const fs = require("fs");
import axios from 'axios';
import moment from "moment";
import { organisationDbGetters } from '@server/organisation';

class FinancialProductsController extends BaseController {

    constructor() {
        super(__filename);
    }

    /**
     * @summary `Create Financial Product`
     * @param {any} req
     * @param {any} res
     * @memberof FinancialProductsController
    */
    async createFinancialProduct(req: any, res: any) {
        try {
            const user = await this.getSessionUser(req);
            if (!user) {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
            }
            if ('orgId' in req.body && 'title'  in req.body) {
                const arrRecords = await financialProductsDbCreator.createFinancialProduct(req.body);
                let data = { "FinancialProduct": arrRecords};
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
     * @summary `Return All Financial Products`
     * @param {any} req
     * @param {any} res
     * @memberof FinancialProductsController
    */
    async getAllFinancialProducts(req: any, res: any) {
        try {
            const user = await this.getSessionUser(req);
            if (!user) {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
            }
            const arrRecords = await financialProductsDbGetter.getAllFinancialProducts(req.body.mode);
            let data = { "FinancialProducts": arrRecords};
            return this.sendResponse(res, this.getResponseObject(null, data, true, 200, ""));  
        } catch (err) {
            console.log('err ', err)
            return this.sendResponse(res, this.getResponseObject(null, err, false, 500, "error occured"));
        }
    }

    /**
         * @summary `Return Financial Product By Id`
         * @param {any} req
         * @param {any} res
         * @memberof FinancialProductsController
        */
    async getFinancialProductById(req: any, res: any) {
        try {
            const user = await this.getSessionUser(req);
            if (!user) {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
            }
            if ('orgId' in req.body) {
                const arrRecords = await financialProductsDbGetter.getFinancialProductById(req.body.orgId);
                let data = { "FinancialProduct": arrRecords};
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
     * @summary `Update Financial Product`
     * @param {any} req
     * @param {any} res
     * @memberof FinancialProductsController
    */
    async updateFinancialProduct(req: any, res: any) {
        try {
            const user = await this.getSessionUser(req);
            if (!user) {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
            }
            if ('orgId' in req.body && 'title' in req.body) {
                const arrRecords = await financialProductsDbUpdater.updateFinancialProduct(req.body.orgId, req.body.title)
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
         * @summary `Delete Financial Product By Id`
         * @param {any} req
         * @param {any} res
         * @memberof FinancialProductsController
        */
    async deleteFinancialProduct(req: any, res: any) {
        try {
            const user = await this.getSessionUser(req);
            if (!user) {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
            }
            if ('orgId' in req.body) {
                const arrRecords = await financialProductsDbDeleter.deleteFinancialProductById(req.body.orgId);
            } else {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 400, 'Invalid request'));
            }
        } catch (err) {
            console.log('err ', err)
            return this.sendResponse(res, this.getResponseObject(null, err, false, 500, "error occured"));
        }
    }
}
export default FinancialProductsController;