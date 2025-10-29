import React, { memo, useEffect, useState } from 'react';
import { filter, map } from 'lodash';
import { useHistory } from 'react-router-dom';
import { AUTH_ROUTES } from '@client/auth';
import { queryPayments } from '@client/payment';
import { sharedDateTimeService } from '@shared/common';
import { useQueryLocalChart } from '@client/chart';
import { useQueryLocalOrganisation } from '@client/organisation';
import { APOLLO_ERROR_MESSAGE, uiVar, Text } from '@client/common';
import { PaymentDetails, sharedPaymentService } from '@shared/payment';
import { queryInvoices, InvoiceTableSkeleton, InvoiceTableHeaderCell, InvoiceTableRow } from '@client/invoice';

export const InvoiceTable = memo(({ mode }) => {
  const history = useHistory();
  const { organisation } = useQueryLocalOrganisation();
  const { chartDateRange, chartCurrency } = useQueryLocalChart();
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState<PaymentDetails[]>([]);

  useEffect(() => {
    (async () => {
      try {
        if (!organisation || !chartCurrency || !chartDateRange) {
          setPayments([]);
          return;
        }

        setIsLoading(true);

        const tenantId = organisation.tenant.id;
        const currency = chartCurrency;
        const dateFromIso = sharedDateTimeService.getUtcDateAsIsoString(chartDateRange.dateFrom);
        const dateToIso = sharedDateTimeService.getUtcDateAsIsoString(chartDateRange.dateTo);
        const [payments, invoices] = await Promise.all([
          queryPayments({ tenantId, currency, dateFrom: dateFromIso, dateTo: dateToIso, mode }),
          queryInvoices({ tenantId, currency, dateTo: dateToIso, mode }),
        ]);

        // Making sure we only render the payments that are between the dates.
        const filteredPayments = filter(payments, ({ date }) => sharedDateTimeService.isDateBetween(date, chartDateRange));

        setPayments(sharedPaymentService.getPaymentDetails({ payments: filteredPayments, invoices }));
        setIsLoading(false);
        uiVar('ready');
      } catch ({ message }) {
        if (message === APOLLO_ERROR_MESSAGE.authenticationFailed) {
          history.push(AUTH_ROUTES.login);
        } else {
          setIsError(true);
          setIsLoading(false);
        }
      }
    })();
  }, [organisation, chartCurrency, chartDateRange, mode]);

  // If no date range is selected the green "select a month" dialog will prompt user to select a month from the chart In that case, don't show the
  // table at all.
  if (!chartDateRange) {
    return null;
  }

  if (isLoading) {
    return <InvoiceTableSkeleton />;
  }

  if (!payments.length) {
    return null;
  }

  // @TODO: Need designs for Invoice Table error state
  if (isError) {
    return (
      <div className="h-32 w-full flex items-center justify-center">
        <Text className="text-lg" variant="gray">
          Oh no! Looks like something went wrong when loading that month of invoices...
        </Text>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col mt-6" data-testid="flnc-invoice-table">
      <div className="w-full align-middle inline-block min-w-full">
        <div className="min-w-invoice-table w-full shadow border-b border-gray-200 sm:rounded-lg overflow-hidden">
          <table className="w-full divide-y divide-gray-200 border-collapse font-medium">
            <thead className="bg-gray-50">
              <tr>
                <InvoiceTableHeaderCell>Amount</InvoiceTableHeaderCell>
                <InvoiceTableHeaderCell>Invoice</InvoiceTableHeaderCell>
                <InvoiceTableHeaderCell>Company</InvoiceTableHeaderCell>
                <InvoiceTableHeaderCell>Due date</InvoiceTableHeaderCell>
                <InvoiceTableHeaderCell>Budget cost</InvoiceTableHeaderCell>
                <InvoiceTableHeaderCell>Realised gain/loss</InvoiceTableHeaderCell>
                <InvoiceTableHeaderCell>Status</InvoiceTableHeaderCell>
              </tr>
            </thead>
            <tbody>
              {map(payments, (paymentDetails) => (
                <InvoiceTableRow paymentDetails={paymentDetails} key={paymentDetails.paymentId} mode={mode} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});
