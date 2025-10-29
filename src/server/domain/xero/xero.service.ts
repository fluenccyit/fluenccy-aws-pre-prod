import { TokenSet } from 'openid-client';
import { isBefore } from 'date-fns';
import { filter, find, includes, isDate, isNumber, isString, last, map } from 'lodash';
import { CurrencyCode, Invoice as XeroInvoice, Payment as XeroPayment, XeroClient } from 'xero-node';
import { loggerService } from '@server/common';
import { GqlSupportedCurrency } from '@graphql';
import { invoiceDbCreators } from '@server/invoice';
import { sharedRateService, SUPPORTED_CURRENCIES } from '@shared/rate';
import { organisationResource } from '@server/organisation';
import { paymentDbCreators, paymentService } from '@server/payment';
import { sharedDateTimeService, sharedUtilService } from '@shared/common';
import {
  XERO_PAGE_SIZE,
  XeroInvoiceStatus,
  XeroInvoiceType,
  XeroProcessedPayment,
  XeroPaymentStatus,
  XeroPaymentType,
  xeroResource,
  XeroProcessedInvoice,
} from '@server/xero';

const { XERO_CLIENT_ID, XERO_CLIENT_SECRET, XERO_CONNECT_OAUTH_REDIRECT_URI, XERO_SIGN_UP_OAUTH_REDIRECT_URI } = process.env;

type GetClientParam = {
  isSignUp?: boolean;
};

type SyncInvoicesAndPaymentsParam = {
  orgId: string;
  tenantId: string;
  lastSynced?: Date | null;
  orgCurrency: string;
  xeroClient: XeroClient;
};

type ProcessAndStoreInvoicesAndPaymentsParam = {
  tenantId: string;
  orgCurrency: GqlSupportedCurrency;
  payments: XeroProcessedPayment[];
  invoices: XeroProcessedInvoice[];
};

type BaseResponseModel = {
  date?: string;
};

const BASE_XERO_SCOPES = ['openid', 'offline_access'];

const service = 'XeroService';
class XeroService {
  getClient({ isSignUp }: GetClientParam = {}) {
    return new XeroClient({
      clientId: XERO_CLIENT_ID,
      clientSecret: XERO_CLIENT_SECRET,
      redirectUris: [isSignUp ? XERO_SIGN_UP_OAUTH_REDIRECT_URI : XERO_CONNECT_OAUTH_REDIRECT_URI],
      scopes: isSignUp ? [...BASE_XERO_SCOPES, 'profile', 'email'] : [...BASE_XERO_SCOPES, 'accounting.settings', 'accounting.transactions'],
      httpTimeout: 3000,
    });
  }

  async getTokenFromUrl(xeroClient: XeroClient, url: string) {
    try {
      return await xeroClient.apiCallback(url);
    } catch {
      return null;
    }
  }

  async getRefreshedTokenSet(xeroClient: XeroClient, oldTokenSet: TokenSet, context?: Dictionary<string>) {
    const logParam = { service, method: 'getRefreshedTokenSet', ...context };

    try {
      const { refresh_token } = oldTokenSet;

      if (!refresh_token) {
        loggerService.error('Token set does not contain refresh token.', logParam);
        return null;
      }

      loggerService.info('Refreshing token.', { ...logParam, refresh_token });

      return await xeroClient.refreshWithRefreshToken(XERO_CLIENT_ID, XERO_CLIENT_SECRET, refresh_token);
    } catch (error) {
      loggerService.error('Failed to refresh Xero token.', { ...logParam, stackTrace: JSON.stringify(error) });
      return null;
    }
  }

  isTokenExpired(tokenSetToCheck: TokenSet) {
    const tokenSet = new TokenSet(tokenSetToCheck);

    return tokenSet.expired();
  }

  async syncInvoicesAndPayments(param: SyncInvoicesAndPaymentsParam) {
    const { orgId, tenantId, lastSynced, orgCurrency, xeroClient } = param;
    const logParam = { service, method: 'syncInvoicesAndPayments', orgId, tenantId, orgCurrency };
    const paymentSyncDate = lastSynced || sharedDateTimeService.getDateFromMonthsAgo(24);
    const invoiceSyncDate = lastSynced || sharedDateTimeService.getDateFromMonthsAgo(36);

    if (!includes(SUPPORTED_CURRENCIES, orgCurrency)) {
      loggerService.info('Organisation currency not supported. Skipping.', logParam);
      return;
    }

    try {
      if (!lastSynced) {
        loggerService.info('Running first sync for tenant.', {
          ...logParam,
          paymentSyncDate: paymentSyncDate.toUTCString(),
          invoiceSyncDate: invoiceSyncDate.toUTCString(),
        });
      } else {
        loggerService.info('Running sync for tenant.', { ...logParam, lastSynced: lastSynced.toUTCString() });
      }

      const baseParam = { xeroClient, tenantId, modifiedSince: lastSynced || undefined };
      const invoices = await xeroResource.queryAllInvoices({ ...baseParam, date: invoiceSyncDate });
      const payments = await xeroResource.queryAllPayments({ ...baseParam, date: paymentSyncDate });

      loggerService.info('Updating sync status of organisation to <calculatingTransactionDetails>.', logParam);
      await organisationResource.updateOrganisation({ orgId, syncStatus: 'calculatingTransactionDetails' });
      await this.processAndStoreInvoicesAndPayments({ tenantId, orgCurrency: orgCurrency as GqlSupportedCurrency, payments, invoices });

      loggerService.info('Updating sync status of organisation to <calculatingTransactionDetailsComplete>.', logParam);
      await organisationResource.updateOrganisation({ orgId, syncStatus: 'calculatingTransactionDetailsComplete' });
    } catch (error) {
      loggerService.error('Failed to calculate transaction details', { ...logParam, message: error.message });
      await organisationResource.updateOrganisation({ orgId, syncStatus: 'calculatingTransactionDetailsError' });
    }
  }

  async processAndStoreInvoicesAndPayments(param: ProcessAndStoreInvoicesAndPaymentsParam) {
    const { tenantId, orgCurrency, payments, invoices } = param;
    const logParam = { method: 'processAndStoreInvoicesAndPayments', tenantId, orgCurrency };
    const invoiceCount = invoices.length;
    const paymentCount = payments.length;
    let syncCount = 0;

    if (!invoiceCount || !paymentCount) {
      loggerService.info('No invoices or payments to process.', { ...logParam, invoiceCount, paymentCount });
      return;
    }

    loggerService.info('Processing and storing invoices and payments', { ...logParam, invoiceCount, paymentCount });

    await sharedUtilService.asyncForEach(payments, async (payment) => {
      const { paymentId } = payment;
      const invoice = find(invoices, ({ invoiceId }) => invoiceId === payment.invoiceId);

      if (!invoice?.invoiceId) {
        loggerService.info('Payment does not have a corresponding invoice. Skipping.', { ...logParam, paymentId });

        return;
      }

      const { invoiceId, currencyCode } = invoice;

      if (currencyCode === orgCurrency) {
        loggerService.info('Payment is not foreign. Skipping.', { ...logParam, paymentId });
        return;
      }

      if (!includes(SUPPORTED_CURRENCIES, currencyCode)) {
        loggerService.info('Payment currency not supported. Skipping.', { ...logParam, paymentId });
        return;
      }

      try {
        const paymentCosts = await paymentService.getPaymentCosts({ baseCurrency: orgCurrency, invoice, payment });

        await Promise.all([
          invoiceDbCreators.createInvoice(invoice),
          paymentDbCreators.createPayment({ ...payment, ...paymentCosts, currencyCode: currencyCode as GqlSupportedCurrency }),
        ]);

        syncCount += 1;
      } catch {
        loggerService.error('Failed to process and save invoice and payment', { ...logParam, paymentId, invoiceId });
      }
    });

    loggerService.info('Synced invoices and payments.', { ...logParam, syncCount });
  }

  async queryAll<T extends BaseResponseModel>(syncDate: Date, queryMethod: (page: number) => Promise<T[]>) {
    let allResults: T[] = [];
    let fetching = true;
    let page = 1;

    while (fetching) {
      const results = await queryMethod(page);

      allResults = [...results, ...allResults];

      // We know we are on the last page, if the number of results is less than the xero pagination size.
      const isLastPage = results.length < XERO_PAGE_SIZE;

      // We only want to fetch results up to a certain point in time (i.e. the sync date). So in order to determine if we have reached that point
      // during the sync, we will check the last entry in the results (Because we are ordering the results by Date in DESC order), and compare it with
      // the sync date. If the last result has a date that is before our sync date, we don't need to continue syncing.
      const lastResult = last(results);
      const isBeforeSyncDate = lastResult && isDate(lastResult.date) && isBefore(new Date(lastResult.date), syncDate);

      if (isLastPage || isBeforeSyncDate) {
        fetching = false;
      } else {
        page += 1;
      }
    }

    return allResults;
  }

  handleRateLimitError = async <T>(retryAfterSeconds: number, callback: () => Promise<T>): Promise<T> => {
    const timeout = retryAfterSeconds * 1000;

    return new Promise((resolve) => {
      setTimeout(async () => {
        const response = await callback();

        resolve(response);
      }, timeout);
    });
  };

  filterAndProcessXeroInvoices(tenantId: string, invoices: XeroInvoice[] = []): XeroProcessedInvoice[] {
    const logParam = { service, method: 'filterAndProcessXeroInvoices', tenantId };

    const filteredInvoices = filter(invoices, (invoice) => {
      return (
        isString(invoice.invoiceID) &&
        isString(invoice.invoiceNumber) &&
        isString(invoice.status) &&
        isString(invoice.type) &&
        isString(invoice.contact?.name) &&
        (isString(invoice.date) || isDate(invoice.date)) &&
        (isString(invoice.dueDate) || isDate(invoice.dueDate)) &&
        isNumber(invoice.total) &&
        isString(invoice.currencyCode) &&
        isNumber(invoice.currencyRate) &&
        isNumber(invoice.amountDue) &&
        isNumber(invoice.amountPaid) &&
        isNumber(invoice.amountCredited) &&
        (invoice.status === 'AUTHORISED' || invoice.status === 'PAID') &&
        sharedRateService.isCurrencySupported((invoice.currencyCode as CurrencyCode)?.toString())
      );
    });

    const difference = invoices.length - filteredInvoices.length;

    if (difference) {
      loggerService.info('Filtered out invoices due to missing data.', { ...logParam, difference });
    }

    return map(filteredInvoices as Required<XeroInvoice>[], (invoice) => ({
      provider: 'xero',
      tenantId,
      invoiceId: invoice.invoiceID,
      invoiceNumber: invoice.invoiceNumber,
      invoiceStatus: (invoice.status as unknown) as XeroInvoiceStatus,
      invoiceType: (invoice.type as unknown) as XeroInvoiceType,
      contactName: invoice.contact?.name as string,
      date: new Date(invoice.date),
      dateDue: new Date(invoice.dueDate),
      total: invoice.total,
      currencyCode: invoice.currencyCode?.toString() as GqlSupportedCurrency,
      currencyRate: invoice.currencyRate,
      amountDue: invoice.amountDue,
      amountPaid: invoice.amountPaid,
      amountCredited: invoice.amountCredited,
    }));
  }

  filterAndProcessXeroPayments(tenantId: string, payments: XeroPayment[] = []): XeroProcessedPayment[] {
    const logParam = { service, method: 'filterAndProcessXeroPayments', tenantId };

    const filteredPayments = filter(payments, (payment) => {
      return (
        isString(payment.paymentID) &&
        isString(payment.status) &&
        isString(payment.paymentType) &&
        isString(payment.invoice?.invoiceID) &&
        (isString(payment.date) || isDate(payment.date)) &&
        isNumber(payment.amount) &&
        isNumber(payment.currencyRate) &&
        payment.status === 'AUTHORISED'
      );
    });

    const difference = payments.length - filteredPayments.length;

    if (difference) {
      loggerService.info('Filtered out payments due to missing data.', { ...logParam, difference });
    }

    return map(filteredPayments as Required<XeroPayment>[], (payment) => ({
      provider: 'xero',
      tenantId,
      paymentId: payment.paymentID,
      paymentStatus: (payment.status as unknown) as XeroPaymentStatus,
      paymentType: (payment.paymentType as unknown) as XeroPaymentType,
      invoiceId: payment.invoice?.invoiceID as string,
      date: new Date(payment.date),
      amount: payment.amount,
      currencyRate: payment.currencyRate,
    }));
  }
}

export const xeroService = new XeroService();
