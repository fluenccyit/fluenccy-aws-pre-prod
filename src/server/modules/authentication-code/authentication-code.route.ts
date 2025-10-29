import express from 'express';
import AuthenticationCodeController from '../authentication-code/authentication-code.controller';

const objAuthenticationCode = new AuthenticationCodeController();
const routerAuthenticationCode = express();

routerAuthenticationCode.post('/send-code', (req, res) => {
    objAuthenticationCode.sendCode(req, res);
});

routerAuthenticationCode.post('/resend-code', (req, res) => {
    objAuthenticationCode.resendCode(req, res);
});

routerAuthenticationCode.post('/verify-code', (req, res) => {
    objAuthenticationCode.verifyCode(req, res);
});

export default routerAuthenticationCode;