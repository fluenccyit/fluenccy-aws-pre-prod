import React, { useMemo } from 'react';
import { FlagIcon, Icon } from '@client/common';
import moment from 'moment';
import getSymbolFromCurrency from 'currency-symbol-map';
import { format } from '@client/utils/number';

export const CurrencyAmount = ({
  mode,
  frdAmountByCurrency,
  filterByCurrency,
  selected,
  organisation,
  convertedData = [],
  currencies,
  homeCurrency,
}) => {
  const totalAmount = useMemo(() => {
    const months = [0, 1, 2, 3, 4, 5].map((i) => moment().add(i, 'months').format('MMM YYYY'));
    return convertedData.reduce((sum, r) => {
      var sumHomeValue = 0;
      if (months.includes(moment(r.dateDue).format('MMM YYYY'))) {
        const {
          forwardValue = 0,
          orderValue = 0,
          spotValue = 0,
          executedForwardValue,
          executedForwardRate,
          executedOrderValue,
          executedOrderRate,
          executedSpotRate,
          executedSpotValue,
          forwardRate = 1,
          optimizedRate = 1,
        } = r.buyingSchedule || {};
        if (executedForwardValue) {
          sumHomeValue = sumHomeValue + Number(executedForwardValue / executedForwardRate || 0);
        }
        if (executedOrderValue) {
          sumHomeValue = sumHomeValue + Number(executedOrderValue / executedOrderRate || 0);
        }
        if (executedSpotValue) {
          sumHomeValue = sumHomeValue + Number(executedSpotValue / executedSpotRate || 0);
        }
        return sum + sumHomeValue;
      }
      return sum;
    }, 0);
  }, [convertedData, selected, homeCurrency]);

  return (
    <div className="flex">
      <div
        className={`flex mx-2 mr-4 items-center font-bold border rounded p-2`}
        style={{ color: mode === 'receivables' ? 'green' : '#FF6978', fontSize: '13px', position: 'relative' }}
      >
        <FlagIcon currency={homeCurrency || organisation.currency} style={{ width: '25px', height: '25px' }} className="flex justify-center" />
        {mode === 'receivables' ? (
          <span className="ml-2">
            {getSymbolFromCurrency(homeCurrency)} <span className="font-bold">{format(Number(totalAmount), 2, 3)}</span>
          </span>
        ) : (
          <span className="ml-2">
            {getSymbolFromCurrency(organisation.currency)} <span className="font-bold">- {format(Number(totalAmount), 2, 3)}</span>
          </span>
        )}
        <div className="absolute" style={{ top: '-10px', right: '-10px' }}>
          <Icon icon="home" style={{ width: '13px' }} />
        </div>
      </div>
      {mode !== 'receivables' &&
        currencies.map(({ currencyCode }) => {
          return (
            <div
              key={currencyCode}
              style={{ color: '#1C1336', fontSize: '13px', opacity: !!frdAmountByCurrency[currencyCode] ? 1 : 0.5 }}
              className={`flex mx-2 items-center font-bold border rounded p-2`}
              onClick={() => filterByCurrency(currencyCode)}
            >
              <FlagIcon currency={currencyCode} style={{ width: '25px', height: '25px' }} className="flex justify-center" />
              <span className="ml-2">
                {getSymbolFromCurrency(currencyCode)} {format(Number(frdAmountByCurrency[currencyCode] || 0), 2, 3) || 0}
              </span>
            </div>
          );
        })}
    </div>
  );
};
