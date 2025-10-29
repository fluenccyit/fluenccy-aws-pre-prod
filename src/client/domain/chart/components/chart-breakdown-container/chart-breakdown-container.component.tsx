import React, { memo, ReactNode } from 'react';
import cn from 'classnames';
import { Text } from '@client/common';

type Props = {
  children: ReactNode;
  className?: string;
  months: number;
  isFullWidth: boolean;
};

const BASE_CLASSES = ['border-gray-200'];

export const ChartBreakdownContainer = memo(({ children, className, months, isFullWidth = false, style = {} }: Props) => {
  const classes = cn(className, BASE_CLASSES, [isFullWidth ? "w-full py-2" : "min-w-chart-breakdown max-w-chart-breakdown p-6 bg-gray-100 border-r"]);

  return (
    <div className={classes} style={style}>
      {!!months && <div className="mb-2">
        <Text className="text-lg mr-2">Breakdown</Text>
        <Text className="text-xs">{months} months</Text>
      </div>}
      {children}
    </div>
  );
});
