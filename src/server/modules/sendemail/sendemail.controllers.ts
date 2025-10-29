import {ResponseModel} from '../shared/response.model'
var csv = require("csvtojson");
import { sharedUtilService } from '@shared/common';
import { emailDbGetters } from './sendemail.db-getters';

import BaseController from '../shared/base.controller'
const fs = require("fs");

class SendEmailController extends BaseController  {

    constructor() {
        super(__filename);
    }

    /**
     * @summary `Return Hedge Invoices`
     * @param {any} req
     * @param {any} res
     * @memberof SendEmailController
    */
    async getSendEmail(req:any, res:any) {
        try {
            const user = await this.getSessionUser(req);
            if (!user) {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
            } 
            
            if('to' in req.body && 'from' in req.body){
                const arrRecords = await emailDbGetters.getSendEmail(req.body.to, req.body.from)
                return this.sendResponse(res, this.getResponseObject(null, arrRecords, true, 200 ,  ""));
            } else {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 400, 'Invalid request'));
            }
        } catch (err) {
            console.log('err ', err)
            return this.sendResponse(res, this.getResponseObject(null, err, false, 500, "error occured"));
        }
    }
   
}

export default SendEmailController;