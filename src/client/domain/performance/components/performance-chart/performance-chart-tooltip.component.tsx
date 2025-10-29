import React, { memo } from 'react';
import { ChartTooltip, useQueryLocalChart } from '@client/chart';
import { useQueryLocalOrganisation } from '@client/organisation';
import { TransactionDetailsByMonthType } from '@shared/transaction';
import { Card, CardContent, Indicator, Text, utilService } from '@client/common';

type Props = {
  transaction: TransactionDetailsByMonthType;
  isOnLeft: boolean;
};

export const PerformanceChartTooltip = memo(({ transaction, isOnLeft, ...rest }: Props) => {
  const { organisation } = useQueryLocalOrganisation();
  const { isChartPerformEnabled } = useQueryLocalChart();
  const { potentialGain, potentialLoss, deliveryGainLoss, performDeliveryGainLoss, month, year } = transaction;

  return (
    <ChartTooltip isOnLeft={isOnLeft} {...rest}>
      <Card>
        <CardContent className="py-3 px-3">
          <Text className="text-xs mb-2 flex" isBlock>
            {month} {year}
          </Text>

          <div className="flex items-center justify-between whitespace-nowrap mb-2">
            <div className="flex items-center justify-between">
              <Indicator className="mr-1" variant="success" />
              <Text className="text-sm whitespace-nowrap mr-4" variant="gray" isBlock>
                Potential gain
              </Text>
            </div>
            <Text className="text-sm" isBlock>
              {utilService.formatCurrencyAmount(potentialGain, organisation?.currency)}
            </Text>
          </div>
          <div className="flex items-center justify-between whitespace-nowrap mb-2">
            <div className="flex items-center justify-between">
              <Indicator className="mr-1" variant="danger" />
              <Text className="text-sm whitespace-nowrap mr-4" variant="gray" isBlock>
                Potential loss
              </Text>
            </div>
            <Text className="text-sm" isBlock>
              {utilService.formatCurrencyAmount(potentialLoss, organisation?.currency)}
            </Text>
          </div>
          <div className="flex items-center justify-between whitespace-nowrap">
            <Text className="text-sm whitespace-nowrap ml-3 mr-4" variant="gray" isBlock>
              Actual gain/loss
            </Text>

            <Text className="text-sm" variant={deliveryGainLoss > 0 ? 'success' : 'danger'} isBlock>
              {utilService.formatCurrencyAmount(deliveryGainLoss, organisation?.currency)}
            </Text>
          </div>
          {isChartPerformEnabled && (
            <div className="flex items-center justify-between whitespace-nowrap mt-2">
              <Text className="text-sm whitespace-nowrap ml-3 mr-4" variant="gray" isBlock>
                Perform gain/loss
              </Text>

              <Text className="text-sm" variant={performDeliveryGainLoss > 0 ? 'success' : 'danger'} isBlock>
                {utilService.formatCurrencyAmount(performDeliveryGainLoss, organisation?.currency)}
              </Text>
            </div>
          )}
        </CardContent>
      </Card>
    </ChartTooltip>
  );
});
