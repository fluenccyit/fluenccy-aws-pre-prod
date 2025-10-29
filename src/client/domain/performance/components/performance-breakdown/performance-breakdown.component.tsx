import React, { memo, useMemo } from 'react';
import { forEach, min } from 'lodash';
import { GqlSupportedCurrency } from '@graphql';
import { PERFORMANCE_MONTHS } from '@client/performance';
import { TransactionBreakdownType } from '@shared/transaction';
import { ChartBreakdownContainer, chartIsPerformEnabledVar, useQueryLocalChart } from '@client/chart';
import { Badge, Card, CardContent, CardSeparator, NumberAnimation, Text, Toggle, utilService, Button } from '@client/common';
import { useHistory } from 'react-router-dom';
import { useQueryLocalUser } from '@client/user';

type Props = {
  breakdown: TransactionBreakdownType;
  currency: GqlSupportedCurrency;
};

export const PerformanceBreakdown = memo(({ months, breakdown, currency, showOnlyRates, mode = null }: Props) => {
  const { fxCost, deliveryGainLoss, potentialLoss, averageBudgetRate, averageDeliveryRate, performAverageDeliveryRate } = breakdown;
  const { isChartPerformEnabled } = useQueryLocalChart();
  const { user } = useQueryLocalUser();
  const history = useHistory();
  const minimumMonthlyGainLoss = useMemo(() => {
    let result = 0;

    forEach(breakdown.transactionsByMonth, ({ deliveryGainLoss }) => {
      result = result ? (min([result, deliveryGainLoss]) as number) : deliveryGainLoss;
    });

    return result;
  }, [breakdown, currency]);

  const gotoPerformance = () => {
    history.push({ pathname: '/charts', state: { chartType: 'performance', mode } });
  };

  const isReceivable = mode === 'receivables';

  return (
    <ChartBreakdownContainer months={showOnlyRates ? '' : months} isFullWidth={showOnlyRates}>
      <Card data-testid="flnc-breakdown-performance">
        <CardContent className={`${showOnlyRates ? 'flex items-center justify-around py-2' : 'p-6'}`}>
          {!showOnlyRates && (
            <>
              {user?.role === 'superdealer' && (
                <div className="flex justify-between items-center">
                  <Text>Markup</Text>
                  <Text>
                    <NumberAnimation value={fxCost} format={(value) => utilService.formatCurrencyAmount(value, currency)} />
                  </Text>
                </div>
              )}

              <div className="flex justify-between items-center mt-1">
                <Text variant={isChartPerformEnabled ? 'dark' : 'gray'}>Saving</Text>
                <Text variant={isChartPerformEnabled ? 'success' : 'gray'}>
                  <NumberAnimation
                    value={isChartPerformEnabled ? breakdown.performDeliveryGainLoss : 0}
                    format={(value) => utilService.formatCurrencyAmount(value, currency)}
                  />
                </Text>
              </div>

              <CardSeparator hasCarat />

              <Text className="text-sm" isBlock>
                Total Realised Gain/Loss
              </Text>
              <Badge className="text-sm" variant={deliveryGainLoss < 0 ? 'danger' : 'success'}>
                <NumberAnimation value={deliveryGainLoss} format={(value) => utilService.formatCurrencyAmount(value, currency)} />
              </Badge>
              <Text className="text-xs mt-1" variant="gray" isBlock>
                Sum of payment variance gain/loss over 18 months.
              </Text>

              <Text className="text-sm mt-3" isBlock>
                Max Realised Loss
              </Text>
              {/* If this value is positive, we will show a gray $0.00, as you cannot have a positive loss. */}
              <Badge className="text-sm" variant={minimumMonthlyGainLoss < 0 ? 'danger' : 'gray'}>
                <NumberAnimation
                  value={minimumMonthlyGainLoss < 0 ? minimumMonthlyGainLoss : 0}
                  format={(value) => utilService.formatCurrencyAmount(value, currency)}
                />
              </Badge>

              <Text className="text-sm mt-3" isBlock>
                Total Potential Loss
              </Text>
              {/* If this value is positive, we will show a gray $0.00, as you cannot have a positive loss. */}
              <Badge className="text-sm" variant={potentialLoss < 0 ? 'danger' : 'gray'}>
                <NumberAnimation
                  value={potentialLoss < 0 ? potentialLoss : 0}
                  format={(value) => utilService.formatCurrencyAmount(value, currency)}
                />
              </Badge>

              <CardSeparator hasCarat />
            </>
          )}
          <div className="flex justify-between" style={showOnlyRates ? { width: '25%' } : {}}>
            <div className="mr-2">
              <Text className="text-sm" isBlock>
                Avg. Raised Cost Rate
              </Text>
              <Text className="text-xs" variant="gray" isBlock>
                Your FX Profit/Loss rate.
              </Text>
            </div>
            <Badge className="self-start text-sm" state="solid" variant="warning">
              <NumberAnimation value={averageBudgetRate} format={(value) => utilService.formatRateAmount(value, currency)} />
            </Badge>
          </div>

          <div className={`flex justify-between ${showOnlyRates ? '' : 'mt-3'}`} style={showOnlyRates ? { width: '25%' } : {}}>
            <div className="mr-2">
              <Text className="text-sm" isBlock>
                {isReceivable ? 'Avg. Received Rate' : 'Avg. Payment Rate'}
              </Text>
              <Text className="text-xs" variant="gray" isBlock>
                Your {isReceivable ? 'average received rate' : 'average payment rate'} over a 24 month period.
              </Text>
            </div>
            <Badge className="self-start text-sm" state="solid" variant="info">
              <NumberAnimation value={averageDeliveryRate} format={(value) => utilService.formatRateAmount(value, currency)} />
            </Badge>
          </div>

          <div className={`flex justify-between ${showOnlyRates ? '' : 'mt-3'}`} style={showOnlyRates ? { width: '25%' } : {}}>
            <div className="mr-2">
              <Text className="text-sm" variant={isChartPerformEnabled ? 'dark' : 'gray'} isBlock>
                Avg. Fluenccy Rate
              </Text>
              <Text className="text-xs" variant="gray" isBlock>
                The Fluenccy benchmark rate.
              </Text>
            </div>
            <Badge
              className="self-start text-sm"
              state={isChartPerformEnabled ? 'solid' : 'opaque'}
              variant={isChartPerformEnabled ? 'success' : 'gray'}
            >
              <Text className="font-bold text-sm text-center" variant="light" isBlock>
                <NumberAnimation
                  value={isChartPerformEnabled ? performAverageDeliveryRate : 0}
                  format={(value) => utilService.formatRateAmount(value, currency)}
                />
              </Text>
            </Badge>
          </div>

          {showOnlyRates && (
            <div className="flex items-center justify-center">
              <Button
                isLink
                isRounded
                onClick={gotoPerformance}
                style={{ width: 'auto', float: 'right', paddingTop: '6px', paddingBottom: '6px', alignSelf: 'flex-end' }}
              >
                View Full Report
              </Button>
            </div>
          )}

          {!showOnlyRates && (
            <div className="flex items-center mt-4">
              <Toggle onChange={() => chartIsPerformEnabledVar(!isChartPerformEnabled)} isChecked={isChartPerformEnabled} />
              <Text className="text-xs ml-4">Show Fluenccy Benchmark</Text>
            </div>
          )}
        </CardContent>
      </Card>
    </ChartBreakdownContainer>
  );
});
