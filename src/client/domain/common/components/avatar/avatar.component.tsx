import React, { forwardRef, ReactNode } from 'react';
import cn from 'classnames';

type Props = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  size?: 'sm' | 'md';
};

const BASE_CLASSES = [
  'inline-flex',
  'items-center',
  'justify-center',
  'text-white',
  'p-2',
  'rounded-full',
  'bg-green-500',
  'border-2',
  'border-transparent',
  'transition:border',
  'duration-200',
  'ease-in-out',
  'outline-none',
];

export const Avatar = forwardRef<HTMLButtonElement, Props>((props, ref) => {
  const { children, className, onClick, size = 'md' } = props;
  const classes = cn(className, BASE_CLASSES, {
    'cursor-pointer focus:outline-none hover:border-gray-400': onClick,
    'h-10 w-10': size === 'md',
    'h-8 w-8 text-sm': size === 'sm',
  });

  if (onClick) {
    return (
      <button className={classes} onClick={onClick} ref={ref}>
        {children}
      </button>
    );
  }

  return <div className={classes}>{children}</div>;
});
