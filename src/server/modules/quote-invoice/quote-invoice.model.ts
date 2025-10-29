import { GqlSupportedCurrency, GqlProvider } from '@graphql';
import { BaseRate, RateDbo, RateModel } from '@server/rate';
import { XeroInvoiceStatus, XeroInvoiceType } from '@server/xero';
import { BaseDbo } from '@server/common';

type BaseInvoiceType = {
  provider: GqlProvider;
  tenantId: string;
  invoiceId: string;
  invoiceNumber: string;
  invoiceStatus: XeroInvoiceStatus;
  invoiceType: XeroInvoiceType;
  contactName: string;
  currencyCode: GqlSupportedCurrency;
  isAddedToBucket: boolean;
};

export type InvoiceModel = BaseInvoiceType & {
  date: Date;
  dateDue: Date;
  total: number;
  currencyRate: number;
  amountCredited: number;
  amountDue: number;
  amountPaid: number;
  encryptedTotal: string;
};

export type InvoiceDbo = BaseInvoiceType & {
  date: string;
  dateDue: string;
  total: number | string;
  currencyRate: number | string;
  amountDue: number | string;
  amountPaid: number | string;
  amountCredited: number | string;
  buyingSchedule: BuyingScheduleDbo;
  encryptedTotal: string;
  import_log_id: string;
  manage_type: string;
  overriden: boolean;
  homeCurrencyCode: GqlSupportedCurrency;
  mode: string;
};

export type HedgeRate = {
  currencyCode: string;
  rates: RateModel[];
  homeCurrencyCode?: string;
}
