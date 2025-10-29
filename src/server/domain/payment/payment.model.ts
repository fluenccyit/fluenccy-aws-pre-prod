import { InvoiceModel } from '@server/invoice';
import { GqlProvider, GqlSupportedCurrency } from '@graphql';
import { XeroPaymentStatus, XeroPaymentType } from '@server/xero';

type BasePaymentType = {
  provider: GqlProvider;
  tenantId: string;
  paymentId: string;
  paymentStatus: XeroPaymentStatus;
  paymentType: XeroPaymentType;
  invoiceId: InvoiceModel['invoiceId'];
  currencyCode: GqlSupportedCurrency;
};

export type PaymentModel = BasePaymentType & {
  date: Date;
  amount: number;
  currencyRate: number;
  maxCost: number;
  maxRate: number;
  minCost: number;
  minRate: number;
  actualCost: number;
};

export type PaymentDbo = BasePaymentType & {
  date: string;
  amount: number | string;
  currencyRate: number | string;
  maxCost: number | string;
  maxRate: number | string;
  minCost: number | string;
  minRate: number | string;
  actualCost: number | string;
};

export type PaymentCosts = {
  minRate: number;
  maxRate: number;
  minCost: number;
  maxCost: number;
  actualCost: number;
};
