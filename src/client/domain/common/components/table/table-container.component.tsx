import React, { ReactNode, memo } from 'react';
import cn from 'classnames';

type Props = {
  children: ReactNode;
  className?: string;
};

const BASE_CLASSES = ['w-full', 'border', 'border-gray-400', 'rounded-lg'];

export const TableContainer = memo(({ className, children }: Props) => {
  const classes = cn(className, BASE_CLASSES);

  return <div className={classes}>{children}</div>;
});
