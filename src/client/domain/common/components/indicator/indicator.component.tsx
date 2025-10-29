import React, { memo } from 'react';
import cn from 'classnames';

type Props = {
  className?: string;
  variant: 'neutral' | 'success' | 'danger';
};

const BASE_CLASSES = ['inline-block', 'rounded-full', 'border-2', 'border-white', 'w-2.5', 'h-2.5'];

export const Indicator = memo(({ className, variant }: Props) => {
  const classes = cn(className, BASE_CLASSES, {
    'bg-red-500': variant === 'danger',
    'bg-gray-900': variant === 'neutral',
    'bg-green-500': variant === 'success',
  });

  return <div className={classes} />;
});
