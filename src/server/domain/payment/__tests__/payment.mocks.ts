import { format } from 'date-fns';
import { PaymentDbo, PaymentModel } from '@server/payment';
import { DATE_TIME_FORMAT, dateService } from '@server/common';

const date = format(new Date(), DATE_TIME_FORMAT.postgresDate);

export const MOCK_PAYMENT_DBO: PaymentDbo = {
  provider: 'xero',
  tenantId: 'mock-tenant-id',
  invoiceId: 'mock-invoice-id',
  paymentId: 'mock-payment-id',
  paymentStatus: 'AUTHORISED',
  paymentType: 'ACCPAYPAYMENT',
  date,
  currencyRate: 0.7654,
  currencyCode: 'USD',
  amount: 500.0,
  minRate: 0,
  minCost: 0,
  maxRate: 0,
  maxCost: 0,
  actualCost: 0,
};

export const MOCK_PAYMENT_MODEL: PaymentModel = {
  provider: MOCK_PAYMENT_DBO.provider,
  tenantId: MOCK_PAYMENT_DBO.tenantId,
  invoiceId: MOCK_PAYMENT_DBO.invoiceId,
  paymentId: MOCK_PAYMENT_DBO.paymentId,
  paymentStatus: MOCK_PAYMENT_DBO.paymentStatus,
  paymentType: MOCK_PAYMENT_DBO.paymentType,
  date: dateService.parseDate(date, DATE_TIME_FORMAT.postgresDate),
  currencyRate: MOCK_PAYMENT_DBO.currencyRate as number,
  currencyCode: MOCK_PAYMENT_DBO.currencyCode,
  amount: MOCK_PAYMENT_DBO.amount as number,
  minRate: MOCK_PAYMENT_DBO.minRate as number,
  minCost: MOCK_PAYMENT_DBO.minCost as number,
  maxRate: MOCK_PAYMENT_DBO.maxRate as number,
  maxCost: MOCK_PAYMENT_DBO.maxCost as number,
  actualCost: MOCK_PAYMENT_DBO.actualCost as number,
};
