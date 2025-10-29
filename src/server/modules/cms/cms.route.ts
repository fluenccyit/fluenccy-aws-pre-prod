import express from 'express';
import CmsEntriesController from '../cms/cms.controller';

const objCmsEntries = new CmsEntriesController();
const routerCms = express();

routerCms.post('/get-entries', (req, res) => {
    objCmsEntries.getEntries(req, res);
});

routerCms.post('/update-entry', (req, res) => {
    objCmsEntries.updateEntry(req, res);
});

routerCms.post('/get-feedbacks', (req, res) => {
    objCmsEntries.getFeedback(req, res);
});

routerCms.post('/update-feedback', (req, res) => {
    objCmsEntries.updateFeedback(req, res);
});

routerCms.post('/get-transactions', (req, res) => {
    objCmsEntries.getTransactions(req, res);
});

routerCms.post('/get-archives', (req, res) => {
    objCmsEntries.getArchives(req, res);
});

routerCms.post('/get-rates', (req, res) => {
    objCmsEntries.getRates(req, res);
});

routerCms.post('/get-avg-order-rate-by-date', (req, res) => {
    objCmsEntries.getAvgFeedbackRateByDate(req, res);
});

routerCms.post('/get-entitlement-currency', (req, res) => {
    objCmsEntries.getEntitlementCurrency(req, res);
});

export default routerCms;