import React from 'react';
import { Card, CardContent, Text, TextSkeleton, utilService } from '@client/common';
import { GqlSupportedCurrency } from '@graphql';
import { TransactionBreakdownType } from '@shared/transaction';
import { useQueryLocalChart } from '@client/chart';

type Props = {
  breakdown: TransactionBreakdownType | null;
  selectedCurrency?: GqlSupportedCurrency;
  isLoading: boolean;
};

type RenderRowParam = {
  label: string;
  value?: number;
  isForeign?: boolean;
  isRate?: boolean;
};

export const AdminOrganisationBreakdownCard = ({ breakdown, selectedCurrency, isLoading }: Props) => {
  const { chartCurrency } = useQueryLocalChart();

  const renderRow = ({ label, value = 0, isForeign, isRate }: RenderRowParam) => {
    const currency = isForeign ? selectedCurrency : chartCurrency;
    const parsedValue = isRate ? value.toFixed(4) : utilService.formatCurrencyAmount(value, currency);

    return (
      <>
        <div className="flex justify-between mb-2 last:mb-0">
          {isLoading && <TextSkeleton className="w-full h-5" />}
          {!isLoading && !breakdown && <TextSkeleton className="w-full h-5" isLoading={false} />}
          {!isLoading && breakdown && (
            <>
              <Text className="inline-block text-sm font-medium">{label}</Text>
              <Text className="inline-block text-sm">{parsedValue}</Text>
            </>
          )}
        </div>
      </>
    );
  };

  return (
    <Card data-testid="flnc-breakdown-payment-variance" className="mt-2 mb-6">
      <CardContent className="p-4">
        {renderRow({ label: 'Total Bought', value: breakdown?.bought, isForeign: true })}
        {renderRow({ label: 'Total Cost', value: breakdown?.budgetCost })}
        {renderRow({ label: 'FX Cost', value: breakdown?.fxCost })}
        {renderRow({ label: 'Gain & Loss', value: breakdown?.deliveryGainLoss })}
        {renderRow({ label: 'Highest Variance', value: breakdown?.maxCost })}
        {renderRow({ label: 'Avg. Variance', value: breakdown?.averageDeliveryCost })}
        {renderRow({ label: 'Lowest Variance', value: breakdown?.minCost })}
        {renderRow({ label: 'Avg. Budget Rate', value: breakdown?.averageBudgetRate, isRate: true })}
        {renderRow({ label: 'Avg. Delivery Rate', value: breakdown?.averageDeliveryRate, isRate: true })}
        {renderRow({ label: 'Avg. Market Rate', value: breakdown?.averageMarketRate, isRate: true })}
        {renderRow({ label: 'Potential Gain', value: breakdown?.potentialGain })}
        {renderRow({ label: 'Potential Loss', value: breakdown?.potentialLoss })}
        {renderRow({ label: 'Market Rate Risk', value: breakdown?.marketRateRisk, isRate: true })}
        {renderRow({ label: 'Market Profit Impact', value: breakdown?.marketProfitImpact })}
        {renderRow({ label: 'Delivery Rate Risk', value: breakdown?.deliveryRateRisk, isRate: true })}
        {renderRow({ label: 'Delivery Profit Impact', value: breakdown?.deliveryProfitImpact })}
        {renderRow({ label: 'Avg. Past Margin', value: breakdown?.averagePastMargin, isRate: true })}
        {renderRow({ label: 'Median Past Margin', value: breakdown?.medianPastMargin, isRate: true })}
      </CardContent>
    </Card>
  );
};
