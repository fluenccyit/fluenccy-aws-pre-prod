import React, { memo, ReactNode } from 'react';
import cn from 'classnames';

type Props = {
  children: ReactNode;
  className?: string;
  variant?: 'dark' | 'gray' | 'light' | 'success' | 'warning' | 'danger' | 'info';
  isBlock?: boolean;
};

const BASE_CLASSES = ['antialiased'];

export const Text = memo(({ children, className, variant = 'dark', isBlock }: Props) => {
  const classes = cn(className, BASE_CLASSES, {
    'text-gray-900': !variant || variant === 'dark',
    'text-gray-500': variant === 'gray',
    'text-white': variant === 'light',
    'text-green-500': variant === 'success',
    'text-orange-500': variant === 'warning',
    'text-red-500': variant === 'danger',
    'text-blue-500': variant === 'info',
  });

  return isBlock ? <div className={classes}>{children}</div> : <span className={classes}>{children}</span>;
});
