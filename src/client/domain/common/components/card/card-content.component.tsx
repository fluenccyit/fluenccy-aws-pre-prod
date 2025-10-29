import React, { ReactNode, forwardRef } from 'react';
import cn from 'classnames';

type Props = {
  children: ReactNode;
  className?: string;
  variant?: 'dark' | 'gray' | 'light';
  hasSeparator?: boolean;
};

const BASE_CLASSES = ['first:rounded-t-md', 'last:rounded-b-md', 'last:border-b-0'];

export const CardContent = forwardRef<HTMLDivElement, Props>(({ children, className, variant = 'light', hasSeparator }, ref) => {
  const classes = cn(className, BASE_CLASSES, {
    'border-b border-gray-200': hasSeparator,
    'bg-gray-900': variant === 'dark',
    'bg-gray-200': variant === 'gray',
    'bg-white': variant === 'light',
  });

  return (
    <div className={classes} ref={ref}>
      {children}
    </div>
  );
});
