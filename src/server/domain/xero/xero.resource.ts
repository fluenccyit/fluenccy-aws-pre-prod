import { last } from 'lodash';
import { format } from 'date-fns';
import { Invoice as XeroInvoice, Payment as XeroPayment, XeroClient } from 'xero-node';
import { DATE_TIME_FORMAT, ERROR_CODE, loggerService } from '@server/common';
import { XeroProcessedPayment, XeroProcessedInvoice, xeroService, XERO_RESPONSE_HEADERS } from '@server/xero';

type BaseQueryParam = {
  tenantId: string;
  xeroClient: XeroClient;
  modifiedSince?: Date;
};

type QueryAllInvoicePaymentsParam = BaseQueryParam & {
  date: Date;
};

type QueryInvoicePaymentsParam = QueryAllInvoicePaymentsParam & {
  page: number;
};

const resource = 'XeroResource';
class XeroResource {
  async queryAllPayments(param: QueryAllInvoicePaymentsParam): Promise<XeroProcessedPayment[]> {
    const { xeroClient, tenantId, date, modifiedSince } = param;
    const logParam = { resource, method: 'queryAllPayments', tenantId };

    loggerService.info('Query all payments.', logParam);

    const payments = await xeroService.queryAll<XeroPayment>(date, async (page: number) => {
      return await this.queryPaymentsByPage({ xeroClient, tenantId, date, modifiedSince, page });
    });

    loggerService.info('Fetched all payments.', { ...logParam, count: payments.length });

    return xeroService.filterAndProcessXeroPayments(tenantId, payments);
  }

  async queryPaymentsByPage(param: QueryInvoicePaymentsParam): Promise<XeroPayment[]> {
    const { xeroClient, tenantId, page, date, modifiedSince } = param;
    const logParam = { resource, method: 'queryPaymentsByPage', page, tenantId };

    try {
      loggerService.info('Fetching page of payments', logParam);

      const { body } = await xeroClient.accountingApi.getPayments(tenantId, modifiedSince, undefined, 'Date DESC', page);

      const { payments = [] } = body;
      const lastPayment = last(payments);
      const lastPaymentDate = lastPayment?.date ? format(new Date(lastPayment.date), DATE_TIME_FORMAT.logDate) : '';
      const syncDate = format(date, DATE_TIME_FORMAT.logDate);

      loggerService.info('Fetched page of payments', { ...logParam, syncDate, lastPaymentDate });

      return payments;
    } catch (error) {
      const { response = {} } = error;
      const { statusCode, headers = {} } = response;
      const retryAfterSeconds = Number(headers[XERO_RESPONSE_HEADERS.retryAfter]);

      if (statusCode === ERROR_CODE.tooManyRequests && retryAfterSeconds) {
        loggerService.error('Rate limit hit fetching payments. Retrying.', { ...logParam, retryAfterSeconds });

        return await xeroService.handleRateLimitError(retryAfterSeconds, () => this.queryPaymentsByPage(param));
      }

      loggerService.error('Failed to fetching page of payments', { ...logParam, stackTrace: JSON.stringify(error) });

      return [];
    }
  }

  async queryAllInvoices(param: QueryAllInvoicePaymentsParam): Promise<XeroProcessedInvoice[]> {
    const { xeroClient, tenantId, date, modifiedSince } = param;
    const logParam = { resource, method: 'queryAllInvoices', tenantId };

    loggerService.info('Query all invoices.', logParam);

    const invoices = await xeroService.queryAll<XeroInvoice>(date, async (page: number) => {
      return await this.queryInvoicesByPage({ xeroClient, tenantId, date, modifiedSince, page });
    });

    loggerService.info('Fetched all invoices.', { ...logParam, count: invoices.length });

    return xeroService.filterAndProcessXeroInvoices(tenantId, invoices);
  }

  async queryInvoicesByPage(param: QueryInvoicePaymentsParam): Promise<XeroInvoice[]> {
    const { xeroClient, tenantId, page, date, modifiedSince } = param;
    const logParam = { resource, method: 'queryInvoicesByPage', tenantId, page };

    try {
      loggerService.info('Fetching page of invoices', logParam);

      const { body } = await xeroClient.accountingApi.getInvoices(
        tenantId,
        modifiedSince,
        undefined,
        'Date DESC',
        undefined,
        undefined,
        undefined,
        undefined,
        page
      );

      const { invoices = [] } = body;
      const lastInvoice = last(invoices);
      const lastInvoiceDate = lastInvoice?.date ? format(new Date(lastInvoice.date), DATE_TIME_FORMAT.logDate) : '';
      const syncDate = format(date, DATE_TIME_FORMAT.logDate);

      loggerService.info('Fetched page of invoices', { ...logParam, syncDate, lastInvoiceDate });

      return body.invoices || [];
    } catch (error) {
      const { response = {} } = error;
      const { statusCode, headers = {} } = response;
      const retryAfterSeconds = Number(headers[XERO_RESPONSE_HEADERS.retryAfter]);

      if (statusCode === ERROR_CODE.tooManyRequests && retryAfterSeconds) {
        loggerService.error('Rate limit hit fetching invoices. Retrying.', { ...logParam, retryAfterSeconds });

        return await xeroService.handleRateLimitError(retryAfterSeconds, () => this.queryInvoicesByPage(param));
      }

      loggerService.error('Failed to fetching page of invoices', { ...logParam, stackTrace: JSON.stringify(error) });

      return [];
    }
  }
}

export const xeroResource = new XeroResource();
