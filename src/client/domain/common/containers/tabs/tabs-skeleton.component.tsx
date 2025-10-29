import React, { memo } from 'react';
import cn from 'classnames';

type Props = {
  isLoading?: boolean;
};

const BASE_CLASSES = ['w-36', 'bg-gray-300', 'rounded-full', 'p-0.5', 'h-8'];

export const TabsSkeleton = memo(({ isLoading = true }: Props) => {
  const classes = cn(BASE_CLASSES, {
    'animate-pulse': isLoading,
  });

  return <div className={classes} />;
});
