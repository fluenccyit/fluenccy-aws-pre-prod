import { GqlSupportedCurrency, GqlProvider } from '@graphql';
import { XeroInvoiceStatus, XeroInvoiceType } from '@server/xero';

type BaseInvoiceType = {
  provider: GqlProvider;
  tenantId: string;
  invoiceId: string;
  invoiceNumber: string;
  invoiceStatus: XeroInvoiceStatus;
  invoiceType: XeroInvoiceType;
  contactName: string;
  currencyCode: GqlSupportedCurrency;
};

export type InvoiceModel = BaseInvoiceType & {
  date: Date;
  dateDue: Date;
  total: number;
  currencyRate: number;
  amountCredited: number;
  amountDue: number;
  amountPaid: number;
};

export type InvoiceDbo = BaseInvoiceType & {
  date: string;
  dateDue: string;
  total: number | string;
  currencyRate: number | string;
  amountDue: number | string;
  amountPaid: number | string;
  amountCredited: number | string;
};
