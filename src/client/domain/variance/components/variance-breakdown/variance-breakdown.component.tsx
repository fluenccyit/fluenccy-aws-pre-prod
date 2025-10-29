import React, { memo } from 'react';
import { format } from 'date-fns';
import { VARIANCE_MONTHS } from '@client/variance';
import { SHARED_DATE_TIME_FORMAT } from '@shared/common';
import { TransactionBreakdownType } from '@shared/transaction';
import { useQueryLocalOrganisation } from '@client/organisation';
import { Card, CardContent, CardSeparator, Text } from '@client/common';
import { ChartBreakdownContainer, useQueryLocalChart } from '@client/chart';
import { VarianceBreakdownCurrencySection, VarianceBreakdownVolatility } from '@client/variance';

type Props = {
  breakdown: TransactionBreakdownType;
  dateFrom: Date;
  dateTo: Date;
  mode: String | null;
};

export const VarianceBreakdown = memo(({ breakdown, dateFrom, dateTo, mode = null }: Props) => {
  const { organisation } = useQueryLocalOrganisation();
  const { chartCurrency } = useQueryLocalChart();

  if (!organisation?.currency || !chartCurrency) {
    return null;
  }

  const displayDateFrom = format(dateFrom, SHARED_DATE_TIME_FORMAT.monthYear);
  const displayDateTo = format(dateTo, SHARED_DATE_TIME_FORMAT.monthYear);

  const isReceivable = mode === 'receivables';

  return (
    <ChartBreakdownContainer months={VARIANCE_MONTHS}>
      <Card data-testid="flnc-breakdown-payment-variance">
        <CardContent className="p-6">
          <VarianceBreakdownCurrencySection heading={isReceivable ? 'Total Sold' : 'Total Bought'} currency={chartCurrency} amount={breakdown.bought}>
            Total currency {isReceivable ? 'sold' : 'bought'} {displayDateFrom} - {displayDateTo}
          </VarianceBreakdownCurrencySection>

          <CardSeparator hasCarat />

          <VarianceBreakdownCurrencySection
            heading={isReceivable ? 'Total Received' : 'Total Cost'}
            currency={organisation.currency}
            amount={breakdown.deliveryCost}
          >
            {isReceivable ? 'Total received' : 'Total cost'} in your home currency to pay your{' '}
            <Text className="font-bold">{chartCurrency} invoices</Text>
          </VarianceBreakdownCurrencySection>

          <CardSeparator hasCarat />

          <Text className="text-lg mb-2" isBlock>
            Total Variance
          </Text>
          <VarianceBreakdownVolatility breakdown={breakdown} baseCurrency={organisation.currency} tradeCurrency={chartCurrency} mode={mode} />
        </CardContent>
      </Card>
    </ChartBreakdownContainer>
  );
});
