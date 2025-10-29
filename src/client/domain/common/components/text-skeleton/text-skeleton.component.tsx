import React, { memo } from 'react';
import cn from 'classnames';

type Props = {
  className?: string;
  isLoading?: boolean;
};

const BASE_CLASSES = ['bg-gray-300', 'rounded-md'];

export const TextSkeleton = memo(({ className, isLoading = true }: Props) => {
  const classes = cn(BASE_CLASSES, className, {
    'animate-pulse': isLoading,
  });

  return <div className={classes} />;
});
