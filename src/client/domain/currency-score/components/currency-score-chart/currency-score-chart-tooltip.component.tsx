import React, { memo } from 'react';
import { Text } from '@client/common';
import { CURRENCY_SCORE_ALLOCATION } from '@shared/currency-score';
import cn from 'classnames';

type Props = {
  currencyScore: number;
};

const BASE_CLASSES = ['bg-white', 'border', 'border-gray-400', 'flex', 'flex-col', 'items-center', 'justify-center', 'rounded-md', 'py-1'];
const BASE_CARAT_CLASSES = ['absolute', 'bg-white', 'border-b', 'border-l', 'transform', '-rotate-45', 'border-gray-400', 'w-2', 'h-2'];

export const CurrencyScoreChartTooltip = memo(({ currencyScore }: Props) => {
  const classes = cn(BASE_CLASSES);
  const caratClasses = cn(BASE_CARAT_CLASSES);

  return (
    <div className={classes}>
      <Text className="font-mono text-sm tracking-tight">
        {currencyScore}/{CURRENCY_SCORE_ALLOCATION.total}
      </Text>
      <div className={caratClasses} style={{ top: '26px' }} />
    </div>
  );
});
