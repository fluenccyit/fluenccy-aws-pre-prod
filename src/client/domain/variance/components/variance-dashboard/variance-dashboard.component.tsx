import React, { useState, memo, useEffect } from 'react';
import { lastDayOfMonth, addMonths, subMonths, parseISO, isValid, max } from 'date-fns';
import { useHistory } from 'react-router-dom';
import { AUTH_ROUTES } from '@client/auth';
import { queryPayments } from '@client/payment';
import { sharedRateService } from '@shared/rate';
import { sharedDateTimeService } from '@shared/common';
import { queryRates, queryForwardPointsBetweenDates } from '@client/rate';
import { useQueryLocalOrganisation } from '@client/organisation';
import { APOLLO_ERROR_MESSAGE, useAnalytics, DateRange } from '@client/common';
import { InvoiceTableContainer, queryInvoices } from '@client/invoice';
import { sharedTransactionService, TransactionBreakdownType } from '@shared/transaction';
import { VARIANCE_MONTHS, VarianceBreakdown, VarianceBreakdownSkeleton, VarianceChart } from '@client/variance';
import { ChartContainer, ChartErrorPanel, ChartLoader, useQueryLocalChart } from '@client/chart';
import { first, last } from 'lodash';
import moment from 'moment';

// Set default months to 12
const DEFAULT_MONTHS = 12;

export const VarianceDashboard = memo(
  ({ 
    numberOfMonths = DEFAULT_MONTHS,
    endWithNonEmpty = false, 
    isDateChanged, 
    newDateFrom, 
    newDateTo, 
    onChangeDateRange, 
    mode = null 
  }) => {
    const history = useHistory();
    
    // Calculate initial date range based on invoice availability
    const [dateFrom, setDateFrom] = useState(null);
    const [dateTo, setDateTo] = useState(null);
    const [initialDateCalculated, setInitialDateCalculated] = useState(false);
    
    const { track } = useAnalytics();
    const { organisation } = useQueryLocalOrganisation();
    const { chartCurrency } = useQueryLocalChart();
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [breakdown, setBreakdown] = useState<TransactionBreakdownType | null>(null);

    // Calculate initial date range based on latest invoice
    useEffect(() => {
      const calculateInitialDateRange = async () => {
        if (!organisation || !chartCurrency || initialDateCalculated) return;

        try {
          const { tenant } = organisation;
          const tenantId = tenant.id;
          const currency = chartCurrency;

          // Get all invoices to find the latest invoice date
          const allInvoices = await queryInvoices({ 
            tenantId, 
            currency, 
            dateTo: sharedDateTimeService.getUtcDateAsIsoString(new Date())
          });

          let calculatedDateFrom: Date;
          let calculatedDateTo: Date;

          if (allInvoices.length > 0) {
            // Find the latest invoice date
            const invoiceDates = allInvoices
              .map(invoice => invoice.invoiceDate)
              .filter(date => date && isValid(parseISO(date)))
              .map(date => parseISO(date));

            if (invoiceDates.length > 0) {
              const latestInvoiceDate = max(invoiceDates);
              
              // Set dateTo to the latest invoice date or today, whichever is earlier
              calculatedDateTo = latestInvoiceDate > new Date() ? new Date() : latestInvoiceDate;
              
              // Set dateFrom to 12 months before the latest invoice date
              const idealDateFrom = subMonths(calculatedDateTo, 12);
              
              // Ensure dateFrom is not more than 36 months ago from today
              const minAllowedDate = subMonths(new Date(), 36);
              calculatedDateFrom = idealDateFrom > minAllowedDate ? idealDateFrom : minAllowedDate;
            } else {
              // Fallback: use current date logic if no valid invoice dates
              calculatedDateTo = new Date();
              calculatedDateFrom = subMonths(new Date(), 12);
            }
          } else {
            // Fallback: use current date logic if no invoices
            calculatedDateTo = new Date();
            calculatedDateFrom = subMonths(new Date(), 12);
          }

          // Use newDateFrom/newDateTo if provided, otherwise use calculated dates
          const finalDateFrom = newDateFrom || calculatedDateFrom;
          const finalDateTo = newDateTo || calculatedDateTo;

          setDateFrom(finalDateFrom);
          setDateTo(finalDateTo);
          setInitialDateCalculated(true);

          console.log('Variance date range calculated:', {
            invoiceCount: allInvoices.length,
            calculatedDateFrom: sharedDateTimeService.getUtcDateAsIsoString(finalDateFrom),
            calculatedDateTo: sharedDateTimeService.getUtcDateAsIsoString(finalDateTo),
            monthsRange: Math.round((finalDateTo.getTime() - finalDateFrom.getTime()) / (1000 * 60 * 60 * 24 * 30))
          });

        } catch (error) {
          console.error('Error calculating variance date range:', error);
          // Fallback to default 12 months
          const fallbackTo = newDateTo || new Date();
          const fallbackFrom = newDateFrom || subMonths(fallbackTo, 12);
          setDateFrom(fallbackFrom);
          setDateTo(fallbackTo);
          setInitialDateCalculated(true);
        }
      };

      calculateInitialDateRange();
    }, [organisation, chartCurrency, newDateFrom, newDateTo, initialDateCalculated]);

    useEffect(() => {
      track('paymentvariance_viewed');
    }, []);

    // Update dates when new props are received
    useEffect(() => {
      if (newDateFrom && newDateFrom !== dateFrom) {
        setDateFrom(newDateFrom);
      }
      if (newDateTo && newDateTo !== dateTo) {
        setDateTo(newDateTo);
      }
    }, [newDateFrom, newDateTo]);

    useEffect(() => {
      (async () => {
        try {
          setIsLoading(true);
          setIsError(false);

          if (!organisation || !chartCurrency || !dateFrom || !dateTo) {
            setIsLoading(false);
            return;
          }

          const { tenant, hedgeMargin, currency: baseCurrency } = organisation;
          const tenantId = tenant.id;
          const currency = chartCurrency;
          
          // Calculate minimum date (36 months from today)
          const minDate = subMonths(new Date(), 36);
          
          // Use the later of user-selected dateFrom or minDate for payments/invoices
          const effectiveDateFrom = dateFrom > minDate ? dateFrom : minDate;
          
          const dateFromIso = sharedDateTimeService.getUtcDateAsIsoString(dateFrom);
          const dateToIso = sharedDateTimeService.getUtcDateAsIsoString(dateTo);
          const effectiveDateFromIso = sharedDateTimeService.getUtcDateAsIsoString(effectiveDateFrom);

          if (baseCurrency !== currency) {
            console.log('Fetching variance data with date range:', { 
              paymentsInvoicesFrom: effectiveDateFromIso, 
              ratesFrom: dateFromIso,
              dateTo: dateToIso 
            });
            
            const [payments, invoices, rates, forwardPoints] = await Promise.all([
              queryPayments({ tenantId, currency, dateFrom: effectiveDateFromIso, dateTo: dateToIso, mode }),
              queryInvoices({ tenantId, currency, dateTo: dateToIso, mode }),
              queryRates({ baseCurrency, tradeCurrency: chartCurrency, dateFrom: dateFromIso, dateTo: dateToIso }),
              queryForwardPointsBetweenDates({ baseCurrency, tradeCurrency: chartCurrency, dateFrom: dateFromIso, dateTo: dateToIso }),
            ]);

            console.log('Fetched variance data:', {
              paymentsCount: payments.length,
              invoicesCount: invoices.length,
              ratesCount: rates.length,
              forwardPointsCount: forwardPoints.length,
              paymentsDateRange: `${effectiveDateFromIso} to ${dateToIso}`,
              ratesDateRange: `${dateFromIso} to ${dateToIso}`
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
              endWithNonEmpty: isDateChanged ? false : endWithNonEmpty,
              numberOfMonths,
            };
            
            console.log('Calculating variance breakdown with:', {
              rateMapKeys: Object.keys(rateMap).length,
              forwardPointMapKeys: Object.keys(forwardPointMap).length,
              effectiveDateUsed: effectiveDateFromIso
            });
            
            const breakdown = sharedTransactionService.calculateBreakdown(param);
            setBreakdown(breakdown);
            setIsLoading(false);
          } else {
            setBreakdown(null);
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Error in variance dashboard:', error);
          if (error.message === APOLLO_ERROR_MESSAGE.authenticationFailed) {
            history.push(AUTH_ROUTES.login);
          } else {
            setIsError(true);
            setIsLoading(false);
          }
        }
      })();
    }, [organisation, chartCurrency, dateFrom, dateTo, mode]);

    if (isLoading || !initialDateCalculated) {
      return (
        <>
          <VarianceBreakdownSkeleton />
          <ChartContainer>
            <ChartLoader />
          </ChartContainer>
        </>
      );
    }

    if (isError || !organisation || !breakdown) {
      return (
        <ChartContainer>
          <ChartErrorPanel state={isError || !organisation ? 'error' : 'no-data'} />
        </ChartContainer>
      );
    }

    // Add check for empty variance data
    if (breakdown && (!breakdown.transactionsByMonth || breakdown.transactionsByMonth.length === 0)) {
      return (
        <ChartContainer>
          <ChartErrorPanel 
            state="no-data" 
            message="Oh no, your Xero account is empty, upload an invoice and resync your account to see your variance analysis"
          />
        </ChartContainer>
      );
    }

    let months = moment(dateTo).diff(moment(dateFrom), 'months');

    let from = dateFrom;
    let to = dateTo;
    if (!isDateChanged) {
      from = first(breakdown.transactionsByMonth)?.dateFrom || dateFrom;
      months = numberOfMonths;
      to = last(breakdown.transactionsByMonth)?.dateTo || dateTo;
    }

    return (
      <>
        <VarianceBreakdown breakdown={breakdown} dateFrom={from} dateTo={to} mode={mode} />
        <div className="flex flex-col w-full">
          <div className="flex justify-end items-center my-2">
            <DateRange from={from} to={to} onChange={onChangeDateRange} />
          </div>
          <ChartContainer>
            <VarianceChart transactionsByMonth={breakdown.transactionsByMonth} dateFrom={from} dateTo={to} mode={mode} />
            <InvoiceTableContainer mode={mode} />
          </ChartContainer>
        </div>
      </>
    );
  }
);
