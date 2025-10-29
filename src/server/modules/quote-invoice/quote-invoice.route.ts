import express from 'express';
import QuoteInvoiceController from '../quote-invoice/quote-invoice.controller';

const objQuoteInvoices = new QuoteInvoiceController();
const routerQuoteInvoices = express();

routerQuoteInvoices.post('/get-invoices', (req, res) => {
    objQuoteInvoices.getInvoices(req, res);
});

routerQuoteInvoices.post('/update-invoices', (req, res) => {
    objQuoteInvoices.updateInvoices(req, res);
});
routerQuoteInvoices.post('/mark-as-managed', (req, res) => {
    objQuoteInvoices.markAsManaged(req, res);
});
routerQuoteInvoices.post('/delete', (req, res) => {
    objQuoteInvoices.delete(req, res);
});
routerQuoteInvoices.post('/clear', (req, res) => {
    objQuoteInvoices.clear(req, res);
});

export default routerQuoteInvoices;