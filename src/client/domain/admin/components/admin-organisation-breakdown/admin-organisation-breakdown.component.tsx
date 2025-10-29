import React, { useEffect, useState } from 'react';
import { lastDayOfMonth } from 'date-fns';
import { useHistory } from 'react-router-dom';
import { AUTH_ROUTES } from '@client/auth';
import { GqlSupportedCurrency } from '@graphql';
import { queryInvoices } from '@client/invoice';
import { queryPayments } from '@client/payment';
import { chartCurrencyVar } from '@client/chart';
import { sharedRateService } from '@shared/rate';
import { sharedDateTimeService } from '@shared/common';
import { APOLLO_ERROR_MESSAGE, Text } from '@client/common';
import { queryRates, queryForwardPoints } from '@client/rate';
import { LocalAdminOrganisationType } from '@client/organisation';
import { sharedTransactionService, TransactionBreakdownType } from '@shared/transaction';
import {
  AdminOrganisationDateRangeSelect,
  AdminOrganisationBreakdownCard,
  AdminOrganisationBreakdownCurrencyTabs,
  transactionBreakdownVar,
} from '@client/admin';

type Props = {
  organisation: LocalAdminOrganisationType;
};

export const AdminOrganisationBreakdown = ({ organisation }: Props) => {
  const dateTo = lastDayOfMonth(new Date());
  const history = useHistory();
  const [breakdown, setBreakdown] = useState<TransactionBreakdownType | null>(null);
  const [dateFrom, setDateFrom] = useState<Date>(sharedDateTimeService.getUtcDateFromMonthsAgo(6));
  const [currency, setCurrency] = useState<GqlSupportedCurrency>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const { tenant, hedgeMargin, currency: baseCurrency } = organisation;

        if (!organisation || !currency || (baseCurrency == currency)) {
          chartCurrencyVar(null);
          transactionBreakdownVar(null);
          return;
        }
        
        const tenantId = tenant.id;
        const dateFromIso = sharedDateTimeService.getUtcDateAsIsoString(dateFrom);
        const dateToIso = sharedDateTimeService.getUtcDateAsIsoString(dateTo);
        const [payments, invoices, rates, forwardPoints] = await Promise.all([
          queryPayments({ tenantId, currency, dateFrom: dateFromIso, dateTo: dateToIso }),
          queryInvoices({ tenantId, currency, dateTo: dateToIso }),
          queryRates({ baseCurrency, tradeCurrency: currency }),
          queryForwardPoints({ baseCurrency, tradeCurrency: currency }),
        ]);

        const rateMap = sharedRateService.generateRateMap(rates);
        const forwardPointMap = sharedRateService.generateForwardPointMap(forwardPoints);
        const param = { dateFrom, dateTo, invoices, payments, rateMap, forwardPointMap, hedgeMargin };
        const breakdown = sharedTransactionService.calculateBreakdown(param);
        setBreakdown(breakdown);
        chartCurrencyVar(currency);
        transactionBreakdownVar(breakdown);
        setIsLoading(false);
      } catch ({ message }) {
        if (message === APOLLO_ERROR_MESSAGE.authenticationFailed) {
          history.push(AUTH_ROUTES.login);
        } else {
          setIsLoading(false);
        }
      }
    })();
  }, [organisation, currency, dateFrom]);

  if ( !isLoading && !breakdown) {
    return null;
  }

  return (
    <>
      <div className="flex justify-between">
        <Text className="text-lg font-bold">Breakdown</Text>
        <div>
          <AdminOrganisationDateRangeSelect setDateFrom={setDateFrom} isDisabled={isLoading || !breakdown} />
        </div>
      </div>
      <div className="mt-2">
        <AdminOrganisationBreakdownCurrencyTabs setCurrency={setCurrency} organisation={organisation} isDisabled={isLoading} />
      </div>
      <AdminOrganisationBreakdownCard breakdown={breakdown} selectedCurrency={currency} isLoading={isLoading} />
    </>
  );
};
