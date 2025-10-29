import React, { memo, useEffect, useRef, useState } from 'react';
import { max } from 'lodash';
import numeral from 'numeral';
import { ChartTooltip } from '@client/chart';
import { useQueryLocalChart } from '@client/chart';
import { useQueryLocalOrganisation } from '@client/organisation';
import { TransactionDetailsByMonthType } from '@shared/transaction';
import { Badge, Card, CardContent, Indicator, Text, utilService } from '@client/common';

type Props = {
  transaction: TransactionDetailsByMonthType;
  isOnLeft: boolean;
};

export const VarianceChartTooltip = memo(({ transaction, isOnLeft, mode, ...rest }: Props) => {
  const actualCostRowRef = useRef<HTMLDivElement>(null);
  const { organisation } = useQueryLocalOrganisation();
  const { chartCurrency } = useQueryLocalChart();
  const [xOffset, setYOffset] = useState(0);

  useEffect(() => {
    // To align the carat to the actual cost row, we need to calculate the height of that row after the tooltip renders, then pass the yOffset to the
    // <ChartTooltip /> component, so it can adjust itself vertically.
    const { height = 0 } = actualCostRowRef.current?.getBoundingClientRect() || {};

    setYOffset(height);
  }, []);

  const { minCost, maxCost, deliveryCost, bought } = transaction;
  const maxCostPercentageVariance = max([numeral(maxCost).divide(deliveryCost).subtract(1).value().toFixed(5), 0]) as number;
  const minCostPercentageVariance = max([numeral(deliveryCost).divide(minCost).subtract(1).value().toFixed(5), 0]) as number;
  const isReceivable = mode === 'receivables';

  return (
    <ChartTooltip caratClassName="bg-gray-200" yOffset={xOffset} isOnLeft={isOnLeft} {...rest}>
      <Card>
        <CardContent className="px-3 py-2 flex items-center justify-between whitespace-nowrap w-full" hasSeparator>
          <Text className="text-sm mr-6 flex" variant="gray" isBlock>
            Invoice volume
          </Text>

          <Text className="text-sm font-medium" isBlock>
            {utilService.formatCurrencyAmount(bought, chartCurrency)} {chartCurrency}
          </Text>
        </CardContent>

        <CardContent className="px-3 py-2 flex items-center justify-between whitespace-nowrap w-full">
          <div className="flex flex-row items-center justify-start">
            <Indicator className="mr-1" variant={isReceivable ? 'success' : 'danger'} />
            <Text className="text-sm mr-2" variant="gray" isBlock>
              Max {isReceivable ? 'received' : 'cost'}
            </Text>
          </div>

          <div className="flex flex-row items-center justify-end w-full">
            <Badge className="mr-2" variant={isReceivable ? 'success' : 'danger'} size="sm" isRounded>
              +{numeral(maxCostPercentageVariance).format('0.00%')}
            </Badge>
            <Text className="text-sm" variant="gray" isBlock>
              {utilService.formatCurrencyAmount(maxCost, organisation?.currency)}
            </Text>
          </div>
        </CardContent>

        <CardContent className="px-3 py-2 flex items-center justify-start whitespace-nowrap w-full" variant="gray" ref={actualCostRowRef}>
          <div className="flex flex-row items-center justify-start">
            <Indicator className="mr-1" variant="neutral" />
            <Text className="text-sm font-medium text-gray-900" isBlock>
              Actual {isReceivable ? 'received' : 'cost'}
            </Text>
          </div>

          <Text className="text-sm font-medium flex justify-end w-full" isBlock>
            {utilService.formatCurrencyAmount(deliveryCost, organisation?.currency)}
          </Text>
        </CardContent>

        <CardContent className="px-3 py-2 flex items-center justify-start whitespace-nowrap w-full">
          <div className="flex flex-row items-center justify-start">
            <Indicator className="mr-1" variant={isReceivable ? 'danger' : 'success'} />
            <Text className="text-sm mr-2" variant="gray" isBlock>
              Min {isReceivable ? 'received' : 'cost'}
            </Text>
          </div>

          <div className="flex flex-row items-center justify-end w-full">
            <Badge className="mr-2" variant={isReceivable ? 'danger' : 'success'} size="sm" isRounded>
              -{numeral(minCostPercentageVariance).format('0.00%')}
            </Badge>
            <Text className="text-sm" variant="gray" isBlock>
              {utilService.formatCurrencyAmount(minCost, organisation?.currency)}
            </Text>
          </div>
        </CardContent>
      </Card>
    </ChartTooltip>
  );
});
