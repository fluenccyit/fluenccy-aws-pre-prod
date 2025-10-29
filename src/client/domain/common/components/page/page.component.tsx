import React, { memo, ReactNode } from 'react';
import cn from 'classnames';

type Props = {
  className?: string;
  children?: ReactNode;
  variant?: 'light' | 'gray';
  autoHeight?: boolean;
};

export const Page = memo(({ className, children, variant = 'gray', autoHeight = false }: Props) => {
  const classes = cn(className, 'flex min-h-screen', {
    'bg-gray-200': variant === 'gray',
    'bg-white': variant === 'light',
    'h-full': !autoHeight,
  });

  return <div className={classes}>{children}</div>;
});
