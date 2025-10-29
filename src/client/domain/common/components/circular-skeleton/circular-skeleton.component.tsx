import React, { memo } from 'react';
import cn from 'classnames';

type Props = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  isLoading?: boolean;
};

const BASE_CLASSES = ['inline-block', 'bg-gray-300', 'rounded-full'];

export const CircularSkeleton = memo(({ size = 'md', className, isLoading = true }: Props) => {
  const classes = cn(BASE_CLASSES, className, {
    'animate-pulse': isLoading,
    'w-2 h-2': size === 'sm',
    'w-6 h-6': size === 'md',
    'w-8 h-8': size === 'lg',
  });

  return <div className={classes} />;
});
