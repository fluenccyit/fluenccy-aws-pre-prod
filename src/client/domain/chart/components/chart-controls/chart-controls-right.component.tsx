import React, { useMemo, useEffect } from 'react';
import { map } from 'lodash';
import { GqlSupportedCurrency } from '@graphql';
import { useQueryLocalOrganisation } from '@client/organisation';
import { Tabs, TabModel, useAnalytics, TabsSkeleton, useQueryLocalCommon } from '@client/common';
import { chartTypeTabs, ChartType, chartTypeVar, chartCurrencyVar, chartDateRangeVar, useQueryLocalChart } from '@client/chart';

export const ChartControlsRight = ({ showCurrency = true, showTabs = true, fullWidth = true, selected }) => {
  const { track } = useAnalytics();
  const { ui } = useQueryLocalCommon();
  const { organisation } = useQueryLocalOrganisation();
  const { chartCurrency, chartType } = useQueryLocalChart();
  const currencyOptions = useMemo(() => map(organisation?.tradeCurrencies || [], (currency) => ({ id: currency, label: currency })), [organisation]);

  useEffect(() => {
    if (currencyOptions.length === 1) {
      handleCurrencyChange(currencyOptions[0]);
    }
  }, [currencyOptions]);

  const handleCurrencyChange = ({ id: selectedCurrency }: TabModel<GqlSupportedCurrency>) => {
    if (chartType === 'variance') {
      track('paymentvariance_currency_select', { selectedCurrency });
    } else if (chartType === 'performance') {
      track('performance_currency_select', { selectedCurrency });
    }

    chartCurrencyVar(selectedCurrency);
    chartDateRangeVar(null);
  };

  const handleChartChange = ({ id: selectedChart }: TabModel<ChartType>) => {
    chartTypeVar(selectedChart);
    chartDateRangeVar(null);
  };

  const renderContent = () => {
    if (ui === 'loading') {
      return <TabsSkeleton />;
    }

    if (!currencyOptions.length) {
      return null;
    }

    return (
      <>
        {showCurrency && currencyOptions.length > 1 && (
          <Tabs<GqlSupportedCurrency>
            tabs={currencyOptions}
            initialTabId={chartCurrency}
            onChange={handleCurrencyChange}
            isDisabled={ui === 'saving'}
          />
        )}
        {showTabs && (
          <Tabs<ChartType>
            className="ml-6"
            initialTabId={chartType}
            tabs={chartTypeTabs(selected)}
            onChange={handleChartChange}
            isDisabled={ui === 'saving'}
          />
        )}
      </>
    );
  };

  return (
    <div className={`flex items-center justify-between ${fullWidth && 'w-full'} h-full px-6`}>
      <div className="flex items-center">{renderContent()}</div>
    </div>
  );
};
