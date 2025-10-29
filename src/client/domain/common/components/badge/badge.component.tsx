import React, { ReactNode } from 'react';
import cn from 'classnames';

export type BadgeVariant = 'success' | 'danger' | 'info' | 'warning' | 'gray';
type Props = {
  className?: string;
  children: ReactNode;
  state?: 'opaque' | 'solid';
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  isRounded?: boolean;
};

const BASE_CLASSES = ['inline-flex', 'font-medium', 'items-center', 'justify-center', 'px-1.5', 'py-0.5'];

export const Badge = ({ className, size = 'md', children, state = 'opaque', variant, isRounded }: Props) => {
  let classes = cn(className, BASE_CLASSES, {
    'rounded-full': isRounded,
    'rounded-md': !isRounded,
    'text-xs': size === 'sm',
    'text-md': size === 'md',
  });

  if (state === 'opaque') {
    classes = cn(classes, 'bg-opacity-50', {
      'bg-green-200 text-green-500': variant === 'success',
      'bg-red-200 text-red-500': variant === 'danger',
      'bg-orange-200 text-orange-500': variant === 'warning',
      'bg-blue-200 text-blue-600': variant === 'info',
      'bg-gray-300 text-gray-600': variant === 'gray',
    });
  }

  if (state === 'solid') {
    classes = cn(classes, 'text-white', {
      'bg-green-500': variant === 'success',
      'bg-red-500': variant === 'danger',
      'bg-orange-500': variant === 'warning',
      'bg-blue-500': variant === 'info',
      'bg-gray-500': variant === 'gray',
    });
  }

  return <div className={classes}>{children}</div>;
};
