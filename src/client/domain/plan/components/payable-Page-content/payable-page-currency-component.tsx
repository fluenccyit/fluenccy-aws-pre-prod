import React, { useMemo, useState } from 'react';
import { map, uniqBy } from 'lodash';
import { Select } from '@client/common';

export const PayableCurrency = ({
  onChangeCurrency,
  onChangeHomeCurrency,
  currencies,
  tab,
  homeCurrencies,
  homeCurrency,
  currency,
  isSuperdealer,
}) => {
  const currencyOptions = useMemo(
    () => map(currencies, (currency) => ({ value: currency.currencyCode, label: currency.currencyCode })),
    [currencies]
  );
  const homeCurrencyOptions = useMemo(() => map(homeCurrencies, (currency) => ({ value: currency, label: currency })), [homeCurrencies]);
  const currencyOptionsLbl = uniqBy([{ value: 'ALL', label: 'All' }, ...currencyOptions], (c) => c.value);
  const homeCurrencyOptionsLbl = uniqBy([{ value: 'ALL', label: 'All' }, ...homeCurrencyOptions], (c) => c.value);

  const renderContent = () => {
    return (
      <>
        {homeCurrencies.length > 0 && (
          <div className={`flex ${isSuperdealer ? 'flex-col' : ''} items-center mr-2`}>
            <span className={`text-sm ${isSuperdealer ? '' : 'mr-1'}`}>Home Currency</span>
            <Select
              options={homeCurrencyOptionsLbl}
              value={homeCurrency}
              onChange={onChangeHomeCurrency}
              isDisabled={false}
              className="mr-2 w-auto"
              style={{ width: 'auto', lineHeight: '0.875rem' }}
            />
          </div>
        )}
        <div className={`flex ${isSuperdealer ? 'flex-col' : ''} items-center mr-2`}>
          <span className={`text-sm ${isSuperdealer ? '' : 'mr-1'}`}>Trade Currency</span>
          <Select
            options={currencyOptionsLbl}
            onChange={onChangeCurrency}
            value={currency}
            isDisabled={false}
            style={{ width: 'auto', lineHeight: '0.875rem' }}
          />
        </div>
        {/* <Tabs<ChartType> className="ml-6" initialTabId={chartType} tabs={CHART_TYPE_TABS} onChange={handleChartChange} isDisabled={ui === 'saving'} /> */}
      </>
    );
  };

  return (
    <div className="flex items-center justify-between h-full px-6 border-r border-gray-200">
      <div className="flex items-center">{renderContent()}</div>
    </div>
  );
};
