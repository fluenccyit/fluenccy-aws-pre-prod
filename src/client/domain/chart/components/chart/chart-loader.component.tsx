import React, { memo } from 'react';
import cn from 'classnames';
import { FluenccyLoader } from '@client/common';

type Props = {
  className?: string;
};

const BASE_CLASSES = ['h-full', 'flex', 'flex-col', 'items-center', 'justify-center', 'h-chart'];

export const ChartLoader = memo(({ className }: Props) => {
  const classes = cn(className, BASE_CLASSES);

  return (
    <div className={classes}>
      <FluenccyLoader variant="gray" className="w-24" />
    </div>
  );
});
