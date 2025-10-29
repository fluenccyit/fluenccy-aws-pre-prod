import React, { ReactNode, memo } from 'react';
import cn from 'classnames';

type Props = {
  children: ReactNode;
  className?: string;
  'data-testid'?: DataTestidType;
};

const BASE_CLASSES = ['bg-white', 'border', 'border-gray-200', 'rounded-lg', 'shadow-sm'];

export const Card = memo(({ children, className, ...rest }: Props) => {
  const classes = cn(className, BASE_CLASSES);

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
});
