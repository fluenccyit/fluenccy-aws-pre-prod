import { Invoice as XeroInvoice, Payment as XeroPayment } from 'xero-node';
import { CurrencyType } from '@shared/rate';
import { GqlSupportedCurrency, GqlProvider } from '@graphql';

export type XeroInvoiceStatus = keyof typeof XeroInvoice.StatusEnum;
export type XeroPaymentStatus = keyof typeof XeroPayment.StatusEnum;
export type XeroInvoiceType = keyof typeof XeroInvoice.TypeEnum;
export type XeroPaymentType = keyof typeof XeroPayment.PaymentTypeEnum;

export type XeroTenantType = {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantType: string;
  orgData: {
    baseCurrency: CurrencyType;
  };
};

export type XeroProcessedPayment = {
  provider: GqlProvider;
  tenantId: string;
  paymentId: string;
  paymentStatus: XeroPaymentStatus;
  paymentType: XeroPaymentType;
  invoiceId: string;
  date: Date;
  amount: number;
  currencyRate: number;
};

export type XeroProcessedInvoice = {
  provider: GqlProvider;
  tenantId: string;
  invoiceId: string;
  invoiceNumber: string;
  invoiceStatus: XeroInvoiceStatus;
  invoiceType: XeroInvoiceType;
  contactName: string;
  date: Date;
  dateDue: Date;
  total: number;
  currencyCode: GqlSupportedCurrency;
  currencyRate: number;
  amountDue: number;
  amountPaid: number;
  amountCredited: number;
};
