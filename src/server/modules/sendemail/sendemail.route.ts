import express from 'express';
import SendEmailController from '../sendemail/sendemail.controllers';

const objSendEmail = new SendEmailController();
const routerSendEmail = express();

routerSendEmail.post('/email', (req, res) => {
    objSendEmail.getSendEmail(req, res);
});


export default routerSendEmail;