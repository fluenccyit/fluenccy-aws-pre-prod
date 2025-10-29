import React, { memo, useEffect, useState } from 'react';
import { last, reverse, sortBy, max } from 'lodash';
import { useHistory } from 'react-router-dom';
import { AUTH_ROUTES } from '@client/auth';
import { lastDayOfMonth, subMonths, parseISO, isValid } from 'date-fns';
import { AppErrorPage } from '@client/app';
import { queryPayments } from '@client/payment';
import { queryInvoices } from '@client/invoice';
import { sharedRateService } from '@shared/rate';
import { GqlCurrencyScoreBreakdown } from '@graphql';
import { DashboardContent } from '@client/dashboard';
import { sharedDateTimeService } from '@shared/common';
import { FX_PURCHASE_MONTHS } from '@client/fx-purchases';
import { queryForwardPointsBetweenDates, queryRates } from '@client/rate';
import { chartCurrencyVar, useQueryLocalChart } from '@client/chart';
import { sharedTransactionService, TransactionBreakdownType } from '@shared/transaction';
import { APOLLO_ERROR_MESSAGE, loggerService, Page, PageContent, uiVar, useQueryLocalCommon } from '@client/common';
import { useQueryLocalOrganisation } from '@client/organisation';

export const DashboardPage = memo(() => {
  const history = useHistory();
  const { ui } = useQueryLocalCommon();
  const { chartCurrency } = useQueryLocalChart();
  const { organisation } = useQueryLocalOrganisation();
  const [transactionBreakdown, setTransactionBreakdown] = useState<TransactionBreakdownType | null>(null);
  const [currencyScoreBreakdown, setCurrencyScoreBreakdown] = useState<GqlCurrencyScoreBreakdown | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (!organisation) {
          return;
        }

        const currencyScoreBreakdown = last(organisation?.currencyScores) || null;

        let currency = chartCurrency;

        if (!currency) {
          const largestCurrencyScoreCurrencyByVolume = reverse(sortBy(currencyScoreBreakdown?.currencyScoreByCurrency, 'deliveryCost'));
          currency = largestCurrencyScoreCurrencyByVolume[0]?.currency || organisation.currency || organisation.tradeCurrencies[0];
          chartCurrencyVar(currency);
        }

        const { tenant, hedgeMargin, currency: baseCurrency } = organisation;
        const tenantId = tenant.id;

        if (baseCurrency !== currency) {
          // First, get all invoices to find the latest invoice date
          const allInvoices = await queryInvoices({ 
            tenantId, 
            currency, 
            dateTo: sharedDateTimeService.getUtcDateAsIsoString(new Date()) // Get all invoices up to today
          });

          // Calculate date ranges based on invoice availability
          let dateFrom: Date;
          let dateTo: Date;

          if (allInvoices.length > 0) {
            // Find the latest invoice date
            const invoiceDates = allInvoices
              .map(invoice => invoice.invoiceDate)
              .filter(date => date && isValid(parseISO(date)))
              .map(date => parseISO(date));

            if (invoiceDates.length > 0) {
              const latestInvoiceDate = max(invoiceDates);
              
              // Set dateTo to the latest invoice date or today, whichever is earlier
              dateTo = latestInvoiceDate > new Date() ? new Date() : latestInvoiceDate;
              
              // Set dateFrom to 12 months before the latest invoice date
              const idealDateFrom = subMonths(dateTo, 12);
              
              // Ensure dateFrom is not more than 36 months ago from today
              const minAllowedDate = subMonths(new Date(), 36);
              dateFrom = idealDateFrom > minAllowedDate ? idealDateFrom : minAllowedDate;
            } else {
              // Fallback: use current date logic if no valid invoice dates
              dateTo = new Date();
              dateFrom = subMonths(new Date(), 12);
            }
          } else {
            // Fallback: use current date logic if no invoices
            dateTo = new Date();
            dateFrom = subMonths(new Date(), 12);
          }

          // Ensure dateFrom is not more than 36 months ago (additional safety check)
          const absoluteMinDate = subMonths(new Date(), 36);
          if (dateFrom < absoluteMinDate) {
            dateFrom = absoluteMinDate;
          }

          const dateFromIso = sharedDateTimeService.getUtcDateAsIsoString(dateFrom);
          const dateToIso = sharedDateTimeService.getUtcDateAsIsoString(dateTo);

          console.log('Dashboard date calculations:', {
            invoiceCount: allInvoices.length,
            calculatedDateFrom: dateFromIso,
            calculatedDateTo: dateToIso,
            monthsRange: Math.round((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24 * 30)),
            currency: currency
          });

          // Now fetch data with calculated date range
          const [payments, invoices, rates, forwardPoints] = await Promise.all([
            queryPayments({ tenantId, currency, dateFrom: dateFromIso, dateTo: dateToIso }),
            queryInvoices({ tenantId, currency, dateTo: dateToIso }),
            queryRates({ baseCurrency, tradeCurrency: currency, dateFrom: dateFromIso, dateTo: dateToIso }),
            queryForwardPointsBetweenDates({ baseCurrency, tradeCurrency: currency, dateFrom: dateFromIso, dateTo: dateToIso }),
          ]);

          console.log('Dashboard data fetched:', {
            paymentsCount: payments.length,
            invoicesCount: invoices.length,
            ratesCount: rates.length,
            forwardPointsCount: forwardPoints.length
          });

          const rateMap = sharedRateService.generateRateMap(rates);
          const forwardPointMap = sharedRateService.generateForwardPointMap(forwardPoints);
          
          const param = { 
            dateFrom, 
            dateTo, 
            invoices, 
            payments, 
            rateMap, 
            forwardPointMap, 
            hedgeMargin,
            numberOfMonths: 12,
            endWithNonEmpty: false
          };
          
          const transactionBreakdown = sharedTransactionService.calculateBreakdown(param);

          setCurrencyScoreBreakdown(last(organisation?.currencyScores) || null);
          setTransactionBreakdown(transactionBreakdown);
          uiVar('ready');
        } else {
          setCurrencyScoreBreakdown(null);
          setTransactionBreakdown(null);
          uiVar('ready');
        }
      } catch (error) {
        console.error('Dashboard error:', error);
        if (error.message === APOLLO_ERROR_MESSAGE.authenticationFailed) {
          history.push(AUTH_ROUTES.login);
        } else {
          loggerService.error(error);
          uiVar('error');
        }
      }
    })();
  }, [organisation, chartCurrency]);

  if (ui === 'error') {
    return <AppErrorPage />;
  }

  return (
    <Page variant="light">
      <DashboardContent 
        showCurrencyScoreBreakdown={false}
        transactionBreakdown={transactionBreakdown}
        currencyScoreBreakdown={currencyScoreBreakdown}
      />
    </Page>
  );
});
