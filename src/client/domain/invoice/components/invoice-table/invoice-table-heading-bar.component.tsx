import React, { memo } from 'react';
import cn from 'classnames';
import { Icon, Text } from '@client/common';
import { useQueryLocalChart } from '@client/chart';

export const InvoiceTableHeadingBar = memo(({ mode = null }) => {
  const { chartDateRange, chartCurrency } = useQueryLocalChart();

  return (
    <div className="flex flex-row items-end h-9 w-full">
      <Text isBlock className={cn('text-lg flex flex-row items-end', { ['text-gray-450']: !chartCurrency })}>
        Accounts {mode ? 'Receivable' : 'Payable'}
      </Text>
      {chartDateRange && (
        <Text className="text-sm ml-1 mr-2 mb-0.5">
          {chartDateRange.month} {chartDateRange.year}
        </Text>
      )}
      {!chartDateRange && chartCurrency && (
        <>
          <Icon className="text-green-500 mb-1 ml-2" icon="info-circle-filled" />
          <Text isBlock className="mb-0.5 flex flex-row items-end text-green-500 text-sm ml-2">
            Select a month from the chart above
          </Text>
        </>
      )}
    </div>
  );
});
