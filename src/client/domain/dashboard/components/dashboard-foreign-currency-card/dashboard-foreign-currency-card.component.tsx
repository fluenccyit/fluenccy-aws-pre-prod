import React, { useMemo } from 'react';
import { filter, map } from 'lodash';
import { TransactionBreakdownType } from '@shared/transaction';
import { useQueryLocalOrganisation } from '@client/organisation';
import { chartCurrencyVar, useQueryLocalChart } from '@client/chart';
import { GqlCurrencyScoreBreakdown, GqlSupportedCurrency } from '@graphql';
import {
  Badge,
  Card,
  CardContent,
  CardSeparator,
  FlagIcon,
  NumberAnimation,
  Select,
  Text,
  TextSkeleton,
  uiVar,
  useQueryLocalCommon,
  utilService,
} from '@client/common';

type Props = {
  transactionBreakdown: TransactionBreakdownType;
  currencyScoreBreakdown: GqlCurrencyScoreBreakdown;
};

export const DashboardForeignCurrencyCard = ({ currencyScoreBreakdown, transactionBreakdown }: Props) => {
  const { ui } = useQueryLocalCommon();
  const { chartCurrency } = useQueryLocalChart();
  const { organisation } = useQueryLocalOrganisation();
  const currencyOptions = useMemo(() => {
    const currenciesWithDeliveries = filter(currencyScoreBreakdown.currencyScoreByCurrency, ({ deliveryCost }) => Boolean(deliveryCost));

    return map(currenciesWithDeliveries || [], ({ currency }) => ({ id: currency, label: currency, value: currency }));
  }, [organisation]);

  if (!organisation || !chartCurrency || !currencyOptions.length) {
    return null;
  }

  const handleCurrencyChange = (currency: GqlSupportedCurrency) => {
    uiVar('saving');
    chartCurrencyVar(currency);
  };

  return (
    <Card className="xl:w-1/2">
      <CardContent className="p-6">
        <div className="flex items-center">
          <Text className="font-bold mr-2">Foreign Currency</Text>
          <Text className="text-xs">Over 12 months</Text>
        </div>
        <Select
          className="mt-4"
          options={currencyOptions}
          onChange={(currency) => handleCurrencyChange(currency as GqlSupportedCurrency)}
          value={chartCurrency}
          isDisabled={ui === 'saving'}
        />
        <div className="flex justify-between items-center w-full mt-6">
          <Text className="text-sm" isBlock>
            Foreign currency total
          </Text>
          {ui === 'saving' ? (
            <TextSkeleton className="h-5 w-1/3" />
          ) : (
            <div className="flex items-center">
              <Text className="text-sm mr-1">{chartCurrency}:</Text>
              <Text className="font-bold text-sm" isBlock>
                <NumberAnimation value={transactionBreakdown.bought} format={(value) => utilService.formatCurrencyAmount(value, chartCurrency)} />
              </Text>
              <FlagIcon className="ml-2" currency={chartCurrency} />
            </div>
          )}
        </div>
        <CardSeparator />
        <div className="flex justify-between items-center w-full mt-4">
          <Text className="text-sm" isBlock>
            Average Market Rate
          </Text>
          {ui === 'saving' ? (
            <TextSkeleton className="h-5 w-1/5" />
          ) : (
            <Badge className="self-start text-sm bg-red-500" state="solid">
              <NumberAnimation
                value={transactionBreakdown.averageMarketRate}
                format={(value) => utilService.formatRateAmount(value, chartCurrency)}
              />
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
