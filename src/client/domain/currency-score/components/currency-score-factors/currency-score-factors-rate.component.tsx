import React, { memo, useEffect, useMemo, useState } from 'react';
import numeral from 'numeral';
import { filter, find, map } from 'lodash';
import { useQueryLocalOrganisation } from '@client/organisation';
import { useQueryLocalCurrencyScore } from '@client/currency-score';
import { GqlSupportedCurrency, GqlCurrencyScoreBreakdown } from '@graphql';
import { CardSeparator, NumberAnimation, Select, Tabs, Text } from '@client/common';

type Props = {
  breakdown: GqlCurrencyScoreBreakdown;
};

export const CurrencyScoreFactorsRate = memo(({ breakdown }: Props) => {
  const { organisation } = useQueryLocalOrganisation();
  const { isCurrencyScorePlanActive } = useQueryLocalCurrencyScore();
  const currencyOptions = useMemo(() => {
    const currenciesWithDeliveries = filter(breakdown.currencyScoreByCurrency, ({ deliveryCost }) => Boolean(deliveryCost));

    return map(currenciesWithDeliveries || [], ({ currency }) => ({ id: currency, label: currency, value: currency }));
  }, [organisation]);
  const [selectedCurrency, setSelectedCurrency] = useState<GqlSupportedCurrency | null>(currencyOptions[0]?.value || null);
  const breakdownByCurrency = find(breakdown.currencyScoreByCurrency, ({ currency, deliveryCost }) => {
    return Boolean(deliveryCost && currency === selectedCurrency);
  });

  useEffect(() => {
    setSelectedCurrency(organisation?.tradeCurrencies[0] || null);
  }, [organisation]);

  if (!selectedCurrency || !breakdownByCurrency || !currencyOptions.length) {
    return null;
  }

  const averageMarketRate = breakdownByCurrency.averageMarketRate;
  const averageDeliveryRate = isCurrencyScorePlanActive ? breakdownByCurrency.performAverageDeliveryRate : breakdownByCurrency.averageDeliveryRate;
  const targetRate = isCurrencyScorePlanActive ? breakdownByCurrency.performAverageBudgetRate : breakdownByCurrency.averageBudgetRate;

  return (
    <div className="py-8 px-4 w-full xl:max-w-lg xl:ml-11 xl:py-0 xl:px-0">
      <Select
        className="mb-6 sm:hidden"
        options={currencyOptions}
        onChange={(currency) => setSelectedCurrency(currency as GqlSupportedCurrency)}
        value={selectedCurrency}
      />
      <div className="hidden mb-6 sm:inline-block">
        <Tabs<GqlSupportedCurrency> tabs={currencyOptions} onChange={({ id }) => setSelectedCurrency(id as GqlSupportedCurrency)} variant="pill" />
      </div>
      <div className="flex items-center justify-between">
        <Text className="text-sm">{isCurrencyScorePlanActive ? "Average Fluenccy Rate" : "Average Delivery Rate"}</Text>
        <Text className="text-sm">
          <NumberAnimation value={averageDeliveryRate} format={(value) => numeral(value).format('0.0000')} isAnimatedInitially={false} />
        </Text>
      </div>
      <CardSeparator />
      <div className="flex items-center justify-between">
        <Text className="text-sm">Average Raised Cost Rate</Text>
        <Text className="text-sm">
          <NumberAnimation value={targetRate} format={(value) => numeral(value).format('0.0000')} isAnimatedInitially={false} />
        </Text>
      </div>
      <CardSeparator />
      <div className="flex items-center justify-between">
        <Text className="text-sm">Average Market Rate</Text>
        <Text className="text-sm">
          <NumberAnimation value={averageMarketRate} format={(value) => numeral(value).format('0.0000')} isAnimatedInitially={false} />
        </Text>
      </div>
    </div>
  );
});
