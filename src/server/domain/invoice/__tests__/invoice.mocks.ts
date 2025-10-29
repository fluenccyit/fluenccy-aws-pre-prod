import { format } from 'date-fns';
import { InvoiceDbo, InvoiceModel } from '@server/invoice';
import { dateService, DATE_TIME_FORMAT } from '@server/common';

const date = format(new Date(), DATE_TIME_FORMAT.postgresDate);

export const MOCK_INVOICE_DBO: InvoiceDbo = {
  tenantId: 'mock-tenant-id',
  invoiceId: 'mock-invoice-id',
  invoiceNumber: 'mock-invoice-number',
  invoiceStatus: 'AUTHORISED',
  invoiceType: 'ACCPAY',
  contactName: 'mock-contact-name',
  date: date,
  dateDue: date,
  total: 500.0,
  currencyCode: 'NZD',
  currencyRate: 0.7654,
  amountDue: 0,
  amountPaid: 500.0,
  amountCredited: 0,
  provider: 'xero',
};

export const MOCK_INVOICE_MODEL: InvoiceModel = {
  ...MOCK_INVOICE_DBO,
  date: dateService.parseDate(date, DATE_TIME_FORMAT.postgresDate),
  dateDue: dateService.parseDate(date, DATE_TIME_FORMAT.postgresDate),
  total: MOCK_INVOICE_DBO.total as number,
  currencyCode: MOCK_INVOICE_DBO.currencyCode,
  currencyRate: MOCK_INVOICE_DBO.currencyRate as number,
  amountDue: MOCK_INVOICE_DBO.amountDue as number,
  amountPaid: MOCK_INVOICE_DBO.amountPaid as number,
  amountCredited: MOCK_INVOICE_DBO.amountCredited as number,
};
