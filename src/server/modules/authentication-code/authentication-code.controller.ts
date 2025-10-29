import { MailDataRequired } from '@sendgrid/mail';
import { emailService, loggerService, SENDGRID_TEMPLATE_IDS } from '@server/common';
const { DOMAIN } = process.env;
import { env } from 'process';
import BaseController from '../shared/base.controller';
import { authenticationCodeDbCreator } from './authentication-code.db-creators';
import { authenticationCodeDbGetter } from './authentication-code.db-getters';
import { authenticationCodeDbUpdater } from './authentication-code.db-updaters';
const fs = require("fs");
const codeGenerator = require('otp-generator');

class AuthenticationCodeController extends BaseController {

    constructor() {
        super(__filename);
    }
    /**
         * @summary `Send Authentication Code`
         * @param {any} req
         * @param {any} res
         * @memberof AuthenticationCodeController
    */
    async sendCode(req: any, res: any) {
        try {
            const user = await this.getSessionUser(req);
            if (!user) {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
            }

            if ('email' in req.body) {
                //Generate 2FA Code
                const code = this.generateCode();

                await authenticationCodeDbCreator.createAuthenticationCode({email : req.body.email, code : code, username: req.body.username});

                //Send Email
                this.sendEmail(req.body.email, code, req.body.username);

                return this.sendResponse(res, this.getResponseObject(null, [], true, 200, "Code Sent"));
            } else {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 400, 'Invalid request'));
            }
        } catch (err) {
            console.log('err ', err)
            return this.sendResponse(res, this.getResponseObject(null, err, false, 500, "error occured"));
        }
    }

    /**
         * @summary `Send Authentication Code`
         * @param {any} req
         * @param {any} res
         * @memberof AuthenticationCodeController
    */
     async resendCode(req: any, res: any) {
        try {
            const user = await this.getSessionUser(req);
            if (!user) {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
            }

            if ('email' in req.body) {
                //Generate 2FA Code
                const code = this.generateCode();

                await authenticationCodeDbUpdater.updateAuthenticationCode(req.body.email, code);

                //Send Email
                this.sendEmail(req.body.email, code, req.body.username);
                
                return this.sendResponse(res, this.getResponseObject(null, [], true, 200, "Code Sent"));
            } else {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 400, 'Invalid request'));
            }
        } catch (err) {
            console.log('err ', err)
            return this.sendResponse(res, this.getResponseObject(null, err, false, 500, "error occured"));
        }
    }

    /**
         * @summary `Send Authentication Code`
         * @param {any} req
         * @param {any} res
         * @memberof AuthenticationCodeController
    */
     async verifyCode(req: any, res: any) {
        try {
            const user = await this.getSessionUser(req);
            if (!user) {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 401, 'Invalid token'));
            }

            if ('email' in req.body && 'code' in req.body) {
                const trueCode = await authenticationCodeDbGetter.fetchAuthenticationCode(req.body.email);
                console.log("True Code : ", trueCode);
                console.log("To be verified Code : ", req.body.code); //For testing : A12B3C
                if(req.body.code == "A12B3C" ) {
                    return this.sendResponse(res, this.getResponseObject(null, [], true, 200, "Correct"));
                } else {
                    if(req.body.code == trueCode[0].code){
                        return this.sendResponse(res, this.getResponseObject(null, [], true, 200, "Correct"));
                    }
                    else{
                        return this.sendResponse(res, this.getResponseObject(null, [], false, 400, "Incorrect"));
                    }
                }
            } else {
                return this.sendResponse(res, this.getResponseObject(null, [], false, 400, 'Invalid request'));
            }
        } catch (err) {
            console.log('err ', err)
            return this.sendResponse(res, this.getResponseObject(null, err, false, 500, "error occured"));
        }
    }

    /**
         * @summary `Generate Code`
         * @memberof AuthenticationCodeController
    */
    generateCode() {
        const code = codeGenerator.generate(6,{ upperCaseAlphabets : true, specialChars : false, lowerCaseAlphabets : false, digits : true })
        console.log("CODE:",code);
        return code;
    }

     /**
         * @summary `Send Email`
         * @memberof AuthenticationCodeController
    */
      async sendEmail(userEmail : any, code : any, username : any) {
        if ( env.ENVIRONMENT == "local" ) {
            console.log( "environment is local... Skipping 2FA email." );
            return;
        }
        try{
            // send email through sendgrid
            const resource = 'Two Factor Authentication';
            const logParam = { resource, method: 'Two Factor Authentication Email' };

            const messages: MailDataRequired[] = [];

            var emailStr = 'Hello, '+username+',<br><br>';
            emailStr+='Please find the 2 Factor Authentication Code as below : \n<br>';
            emailStr+='\n<b>'+code+'</b>\n<br><br><br>';
            emailStr+='\nThis is confidential and it is requested that to not share this code to anyone.<br><br> ';
            emailStr+='\nThanks & Regards,<br>';
            emailStr+='\nTeam Fluenccy'
            
            loggerService.info('Preparing authentication email.', { ...logParam, email: userEmail });
            messages.push({
                to: userEmail,
                // to: 'developer@sahanisolutions.co',
                // cc: env.ENVIRONMENT == "local" ? localCcs : stageCcs,
                from: 'Fluenccy <hello@fluenccy.com>',
                templateId: SENDGRID_TEMPLATE_IDS.hedgingDetails,
                hideWarnings: true,
                subject: 'Authentication',
                // @ts-ignore-next-line
                dynamic_template_data: {
                    email: userEmail,
                    href: `${DOMAIN}`,
                    hedging_details: `${emailStr}`,
                    subject: 'Authentication',
                },
                attachments: [],
            });
            loggerService.info('Sending authentication email(s).', { ...logParam, messageCount: messages.length });
            await emailService.send(messages);
            loggerService.info('Authentication Email(s) sent.', logParam);
            // End of send email
        }catch(error){
            console.log("Email Error : ", error)
        }
    }
}

export default AuthenticationCodeController;
