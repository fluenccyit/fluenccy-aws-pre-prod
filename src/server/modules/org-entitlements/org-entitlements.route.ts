import express from 'express';
import OrgEntitlementsController from '../org-entitlements/org-entitlements.controller';

const objOrgEntitlements = new OrgEntitlementsController();
const routerOrgEntitlements = express();

routerOrgEntitlements.post('/create-OrgEntitlement', (req, res) => {
    objOrgEntitlements.createOrgEntitlements(req, res);
});

routerOrgEntitlements.post('/get-OrgEntitlements', (req, res) => {
    objOrgEntitlements.getOrgEntitlements(req, res);
});

routerOrgEntitlements.post('/update-OrgEntitlements', (req, res) => {
    objOrgEntitlements.updateOrgEntitlements(req, res);
});

routerOrgEntitlements.post('/get-MarginPercentage', (req, res) => {
    objOrgEntitlements.getMarginPercentage(req, res);
});

routerOrgEntitlements.post('/update-MarginPercentage', (req, res) => {
    objOrgEntitlements.updateMarginPercentage(req, res);
});

routerOrgEntitlements.post('/update-FinancialInstitute', (req, res) => {
    objOrgEntitlements.updateFinancialInstitute(req, res);
});

routerOrgEntitlements.post('/get-PlanApprovalEmail', (req, res) => {
    objOrgEntitlements.getPlanApprovalEmail(req, res);
});

routerOrgEntitlements.post('/update-PlanApprovalEmail', (req, res) => {
    objOrgEntitlements.updatePlanApprovalEmail(req, res);
});

routerOrgEntitlements.post('/get-cms-entitlements', (req, res) => {
    objOrgEntitlements.getCmsEntitlements(req, res);
});

routerOrgEntitlements.post('/update-cms-entitlements', (req, res) => {
    objOrgEntitlements.updateCmsEntitlements(req, res);
});


export default routerOrgEntitlements;