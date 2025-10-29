import React, { ReactNode } from 'react';
import cn from 'classnames';

type Props = {
  children: ReactNode;
  className?: string;
  variant?: 'success' | 'warning' | 'danger' | 'info';
  isFullScreen?: boolean;
};

const BASE_CLASSES = ['left-0', 'right-0', 'top-14', 'px-4', 'z-banner', 'md:px-6', 'md:top-20'];
const BASE_CONTENT_CLASSES = ['flex', 'items-center', 'h-12', 'mx-auto', 'z-header'];

export const Banner = ({ children, className, variant, isFullScreen = true, absolute = true }: Props) => {
  const classes = cn(className, BASE_CLASSES, {
    'bg-green-200': variant === 'success',
    'bg-orange-200': variant === 'warning',
    'bg-red-200': variant === 'danger',
    'bg-blue-200': variant === 'info',
    'absolute': absolute
  });
  const contentClasses = cn(BASE_CONTENT_CLASSES, { 'lg:max-w-7xl': !isFullScreen });

  return (
    <div className={classes}>
      <div className={contentClasses}>{children}</div>
    </div>
  );
};
