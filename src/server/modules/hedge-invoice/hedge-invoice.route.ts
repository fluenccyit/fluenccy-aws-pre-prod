import express from 'express';
import HedgeInvoiceController from '../hedge-invoice/hedge-invoice.controller';

const objHedgeInvoices = new HedgeInvoiceController();
const routerHedgeInvoices = express();

routerHedgeInvoices.post('/invoices', (req, res) => {
    objHedgeInvoices.getHedgeInvoices(req, res);
});

routerHedgeInvoices.post('/get-invoices', (req, res) => {
    objHedgeInvoices.getInvoices(req, res);
});
routerHedgeInvoices.post('/get-archived-invoices', (req, res) => {
    objHedgeInvoices.getArchivedInvoices(req, res);
});

routerHedgeInvoices.post('/update-invoices', (req, res) => {
    objHedgeInvoices.updateHedgeInvoices(req, res);
});

routerHedgeInvoices.post('/update-invoice', (req, res) => {
    objHedgeInvoices.updateInvoice(req, res);
});

routerHedgeInvoices.post('/approve-invoice', (req, res) => {
    objHedgeInvoices.approveInvoice(req, res);
});

routerHedgeInvoices.post('/mxmarket/live-spot-rate', async (req, res) => {
    return await objHedgeInvoices.getLiveSpotRate(req, res);
});

routerHedgeInvoices.post('/mxmarket/monthly-history', async (req, res) => {
    return await objHedgeInvoices.getMonthlyMxMarketHistort(req, res);
});

routerHedgeInvoices.post('/get-recurring-plans', (req, res) => {
    objHedgeInvoices.getRecurringPlans(req, res);
});

routerHedgeInvoices.post('/delete-recurring-plan', (req, res) => {
    objHedgeInvoices.deleteRecurringPlan(req, res);
});

routerHedgeInvoices.post('/update-recurring-plan', (req, res) => {
    objHedgeInvoices.updateRecurringPlan(req, res);
});

routerHedgeInvoices.post('/update-buying-schedule', (req, res) => {
    objHedgeInvoices.updateBuyingSchedule(req, res);
});


routerHedgeInvoices.post('/mark-as-paid-and-received', (req, res) => {
    objHedgeInvoices.markAsPaidAndReceived(req, res);
});


routerHedgeInvoices.post('/generate-term-sheet', (req, res) => {
    objHedgeInvoices.generateTermSheet(req, res);
});

export default routerHedgeInvoices;