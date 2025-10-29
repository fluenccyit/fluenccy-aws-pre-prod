import React, { memo, useMemo } from 'react';
import { GqlSupportedCurrency } from '@graphql';
import { TransactionBreakdownType } from '@shared/transaction';
import { ChartBreakdownContainer, useQueryLocalChart } from '@client/chart';
import { Badge, Button, Card, CardContent, CardSeparator, Text, Toggle, useQueryLocalCommon, utilService, NumberAnimation } from '@client/common';
import { VarianceBreakdownCurrencySection } from '@client/variance';
import { format } from 'date-fns';
import { SHARED_DATE_TIME_FORMAT } from '@shared/common';
import { useJoinWaitlist, useQueryLocalOrganisation } from '@client/organisation';
import { FX_PURCHASE_MONTHS, showFluenccyPerformVar, showMarketRateVar, useQueryLocalFxPurchases } from '@client/fx-purchases';
import cn from 'classnames';
import { useHistory } from 'react-router-dom';

type Props = {
  breakdown: TransactionBreakdownType;
  currency: GqlSupportedCurrency;
  mode: String | null;
};

export const FxPurchasesBreakdown = memo(({ breakdown, currency, mode = null }: Props) => {
  const isReceivable = mode === 'receivables';
  const { chartCurrency } = useQueryLocalChart();
  const { averageMarketRate, averageDeliveryRate, performAverageDeliveryRate } = breakdown;
  const { joinWaitlist } = useJoinWaitlist();
  const { ui } = useQueryLocalCommon();
  const { organisation } = useQueryLocalOrganisation();
  const { showMarketRate, showFluenccyPerform } = useQueryLocalFxPurchases();
  const marketRateToggleColour = useMemo(() => (showMarketRate ? 'bg-red-500' : ''), [showMarketRate]);
  const history = useHistory();

  if (!chartCurrency) {
    return null;
  }

  const navigateToImsDashbpard = () => history.push({ pathname: '/plan', state: { showDashboard: true } });

  const displayDateFrom = format(breakdown.dateFrom, SHARED_DATE_TIME_FORMAT.monthYear);
  const displayDateTo = format(breakdown.dateTo, SHARED_DATE_TIME_FORMAT.monthYear);

  const ctaClasses = organisation ? cn('w-full my-2') : '';

  return (
    <ChartBreakdownContainer months={FX_PURCHASE_MONTHS}>
      <Card data-testid="flnc-breakdown-performance">
        <CardContent className="p-6">
          <VarianceBreakdownCurrencySection
            heading={mode === 'receivables' ? 'Total Sold' : 'Total Bought'}
            currency={chartCurrency}
            amount={breakdown.bought}
          >
            Total currency {mode === 'receivables' ? 'sold' : 'bought'} {displayDateFrom} - {displayDateTo}
          </VarianceBreakdownCurrencySection>

          <CardSeparator hasCarat />

          <div className="flex justify-between mb-2">
            <div className="mr-2">
              <Text className="text-sm" isBlock>
                Market Rate
              </Text>
              <Text className="text-xs" variant="gray" isBlock>
                The wholesale rate for the month.
              </Text>
            </div>
            <Badge className="self-start text-sm bg-red-500" state="solid">
              {utilService.formatRateAmount(averageMarketRate, currency)}
            </Badge>
          </div>
          <Toggle isChecked={showMarketRate} onChange={showMarketRateVar} className={`mb-5 ${marketRateToggleColour}`} />

          <div className="flex justify-between mb-5">
            <div className="mr-2">
              <Text className="text-sm" isBlock>
              {isReceivable ? 'Received Rate' : 'Payment Rate'}
              </Text>
              <Text className="text-xs" variant="gray" isBlock>
              Your {isReceivable ? 'average received rate' : 'average payment rate'} over a 24 month period.
              </Text>
            </div>
            <Badge className="self-start text-sm" state="solid" variant="info">
              {utilService.formatRateAmount(averageDeliveryRate, currency)}
            </Badge>
          </div>

          <div className="flex justify-between mb-2">
            <div className="mr-2">
              <div className="flex">
                <Text className="mr-1 text-sm">Fluenccy</Text>
                <Text className="text-sm text-green-500 ">Rate</Text>
                <Text className="text-base font-sans text-green-500">&trade;</Text>
              </div>
              <Text className="text-xs" variant="gray" isBlock>
                The Fluenccy benchmark rate.
              </Text>
            </div>
            <Badge className="self-start text-sm" state={showFluenccyPerform ? 'solid' : 'opaque'} variant={showFluenccyPerform ? 'success' : 'gray'}>
              <Text className="font-bold text-sm text-center" variant="light" isBlock>
                <NumberAnimation
                  value={showFluenccyPerform ? performAverageDeliveryRate : 0}
                  format={(value) => utilService.formatRateAmount(value, currency)}
                />
              </Text>
            </Badge>
          </div>
          <Toggle isChecked={showFluenccyPerform} onChange={showFluenccyPerformVar} className="mb-5" />
          {organisation && (
            <Button className={ctaClasses} onClick={navigateToImsDashbpard} isDisabled={ui === 'saving'} isRounded>
              See live costs
            </Button>
          )}
        </CardContent>
      </Card>
    </ChartBreakdownContainer>
  );
});
