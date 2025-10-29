import React, { memo } from 'react';
import { ChartTooltip, useQueryLocalChart } from '@client/chart';
import { TransactionDetailsByMonthType } from '@shared/transaction';
import { Badge, Card, CardContent, Text, utilService } from '@client/common';
import { useQueryLocalFxPurchases } from '@client/fx-purchases';

type Props = {
  transaction: TransactionDetailsByMonthType;
  isOnLeft: boolean;
};

export const FxPurchasesChartTooltip = memo(({ transaction, isOnLeft, ...rest }: Props) => {
  const { averageMarketRate, averageDeliveryRate, performAverageDeliveryRate, month, year, bought } = transaction;
  const { chartCurrency } = useQueryLocalChart();
  const { showMarketRate, showFluenccyPerform } = useQueryLocalFxPurchases();

  return (
    <ChartTooltip isOnLeft={isOnLeft} {...rest}>
      <Card>
        <CardContent className="py-3 px-3">
          <Text className="text-xs mb-2 flex" isBlock>
            {month} {year}
          </Text>
          {showMarketRate && (
            <div className="flex items-center justify-between whitespace-nowrap mb-2">
              <Text className="text-sm whitespace-nowrap mr-4" variant="gray" isBlock>
                Market rate
              </Text>
              <Badge className="self-start text-sm bg-red-500" state="solid">
                {utilService.formatRateAmount(averageMarketRate, chartCurrency)}
              </Badge>
            </div>
          )}
          <div className="flex items-center justify-between whitespace-nowrap mb-2">
            <Text className="text-sm whitespace-nowrap mr-4" variant="gray" isBlock>
              Delivery rate
            </Text>
            <Badge className="self-start text-sm" state="solid" variant="info">
              {utilService.formatRateAmount(averageDeliveryRate, chartCurrency)}
            </Badge>
          </div>
          {showFluenccyPerform && (
            <div className="flex items-center justify-between whitespace-nowrap mb-2">
              <Text className="text-sm whitespace-nowrap mr-4" variant="gray" isBlock>
                Fluenccy Perform
              </Text>
              <Badge className="self-start text-sm" state="solid" variant="success">
                {utilService.formatRateAmount(performAverageDeliveryRate, chartCurrency)}
              </Badge>
            </div>
          )}
          <div className="flex items-center justify-between whitespace-nowrap mb-2">
            <Text className="text-sm whitespace-nowrap mr-4" variant="gray" isBlock>
              Total
            </Text>
            <Text className="text-sm whitespace-nowrap" variant="gray" isBlock>
              {`${utilService.formatCurrencyAmount(bought, chartCurrency)} ${chartCurrency}`}
            </Text>
          </div>
        </CardContent>
      </Card>
    </ChartTooltip>
  );
});
