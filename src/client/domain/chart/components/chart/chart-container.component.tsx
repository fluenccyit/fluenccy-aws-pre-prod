import React, { ReactNode, memo } from 'react';
import cn from 'classnames';

type Props = {
  children: ReactNode;
  className?: string;
  showBanner?: boolean
};

const BASE_CLASSES = ['w-full', 'flex', 'flex-col', 'overflow-x-auto'];

export const ChartContainer = memo(({ className, children }: Props) => {
  const classes = cn(className, BASE_CLASSES);

  return (
    <div className={classes}>
      {children}
    </div>
  );
});
