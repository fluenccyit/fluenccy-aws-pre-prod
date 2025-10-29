import React, { memo, ReactNode } from 'react';
import cn from 'classnames';

type Props = {
  children: ReactNode;
  className?: string;
  variant?: 'dark' | 'light';
};

const BASE_CLASSES = ['fixed', 'top-0', 'left-0', 'w-full', 'shadow-md', 'z-header'];

export const Header = memo(({ className, children, variant = 'dark' }: Props) => {
  const classes = cn(className, BASE_CLASSES, {
    'bg-gray-900': variant === 'dark',
    'bg-white': variant === 'light',
  });

  return (
    <header className={classes}>
      <nav className={`flex items-center px-4 z-header h-14 md:h-20 md:px-6`}>{children}</nav>
    </header>
  );
});
