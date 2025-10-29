import React, { memo } from 'react';
import { GqlSupportedCurrency } from '@graphql';
import { VarianceBreakdownTooltip } from '@client/variance';
import { TransactionBreakdownType } from '@shared/transaction';
import { Text, utilService, TextSkeleton } from '@client/common';

type Props = {
  breakdown: TransactionBreakdownType;
  baseCurrency: GqlSupportedCurrency;
  tradeCurrency: GqlSupportedCurrency;
  isEmpty?: boolean;
};

export const VarianceBreakdownVolatility = memo(({ breakdown, baseCurrency, tradeCurrency, isEmpty, mode }: Props) => {
  const { maxCost, maxRate, averageDeliveryCost, averageDeliveryRate, minCost, minRate } = breakdown;
  const isReceivable = mode === 'receivables';

  return (
    <div className="flex">
      <div className="bg-gray-200 rounded-full w-3 mr-2" />
      <div className="w-full" style={{ marginLeft: '-19px' }}>
        <VarianceBreakdownTooltip variant={isReceivable ? 'success' : 'danger'}>
          <Text className="text-sm font-bold" variant="gray">
            High <Text variant={isReceivable ? 'success' : 'danger'}>{utilService.formatCurrencyAmount(maxCost, baseCurrency)}</Text>
          </Text>
        </VarianceBreakdownTooltip>

        {isEmpty ? (
          <TextSkeleton isLoading={false} className="h-3 w-44 mx-6 my-2" />
        ) : (
          <Text className="text-sm ml-6 mt-1" isBlock>
            <Text className="font-bold">{utilService.formatCurrencyAmount(1, baseCurrency)}</Text> {baseCurrency} bought
            <Text className="font-bold mx-1">{utilService.formatCurrencyRateAmount(minRate, tradeCurrency)}</Text>
            {tradeCurrency}
          </Text>
        )}

        <VarianceBreakdownTooltip className="mt-4" variant="neutral">
          <Text className="text-sm font-bold" variant="gray">
            Average <Text variant="dark">{utilService.formatCurrencyAmount(averageDeliveryCost, baseCurrency)}</Text>
          </Text>
        </VarianceBreakdownTooltip>

        {isEmpty ? (
          <>
            <TextSkeleton isLoading={false} className="h-3 w-44 mx-6 my-2" />
            <TextSkeleton isLoading={false} className="h-3 w-32 mx-6 my-1" />
            <TextSkeleton isLoading={false} className="h-3 w-16 mx-6 mt-1 mb-2" />
          </>
        ) : (
          <>
            <Text className="text-sm ml-6 mt-1" isBlock>
              <Text className="font-bold">{utilService.formatCurrencyAmount(1, baseCurrency)}</Text> {baseCurrency} bought
              <Text className="font-bold mx-1">{utilService.formatCurrencyRateAmount(averageDeliveryRate, tradeCurrency)}</Text>
              {tradeCurrency}
            </Text>
            <Text className="text-xs ml-6" variant="gray" isBlock>
              Without a plan in place you have increased risk to currency loss
            </Text>
          </>
        )}

        <VarianceBreakdownTooltip className="mt-4" variant={isReceivable ? 'danger' : 'success'}>
          <Text className="text-sm font-bold" variant="gray">
            Low <Text variant={isReceivable ? 'danger' : 'success'}>{utilService.formatCurrencyAmount(minCost, baseCurrency)}</Text>
          </Text>
        </VarianceBreakdownTooltip>

        {isEmpty ? (
          <TextSkeleton isLoading={false} className="h-3 w-44 mx-6 my-2" />
        ) : (
          <Text className="text-sm ml-6 mt-1" isBlock>
            <Text className="font-bold">{utilService.formatCurrencyAmount(1, baseCurrency)}</Text> {baseCurrency} bought
            <Text className="font-bold mx-1">{utilService.formatCurrencyRateAmount(maxRate, tradeCurrency)}</Text>
            {tradeCurrency}
          </Text>
        )}
      </div>
    </div>
  );
});
