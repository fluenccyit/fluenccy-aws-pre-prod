import express from 'express';
import routerImportFiles from './import-files/import-files.route';
import routerHedgeInvoices from './hedge-invoice/hedge-invoice.route'
import routerSendEmail from './sendemail/sendemail.route'
import routerOrgEntitlements from './org-entitlements/org-entitlements.route';
import routerFinancialProducts from './financial-products/financial-products.route';
import routerProfile from './profile/profile.route';
import routerAuthenticationCode from './authentication-code/authentication-code.route';
import routerCms from './cms/cms.route';
import routerQuote from './quote-invoice/quote-invoice.route';

const router = express();

router.use('/import', routerImportFiles);
router.use('/hedge', routerHedgeInvoices);
router.use('/sendemail', routerSendEmail);
router.use('/orgEntitlement', routerOrgEntitlements);
router.use('/financialProducts', routerFinancialProducts);
router.use('/profile',routerProfile)
router.use('/auth',routerAuthenticationCode)
router.use('/cms', routerCms);
router.use('/quotes', routerQuote);

export default router;