import React, { ReactNode, memo } from 'react';
import cn from 'classnames';
import { Indicator } from '@client/common';

type Props = {
  children: ReactNode;
  className?: string;
  variant: 'neutral' | 'success' | 'danger';
};

const BASE_CLASSES = ['flex', 'items-center', 'w-full'];

export const VarianceBreakdownTooltip = memo(({ children, className, variant }: Props) => {
  const classes = cn(className, BASE_CLASSES);

  return (
    <div className={classes}>
      <Indicator className="mr-3" variant={variant} />
      <div className="relative bg-white border border-gray-200 rounded-sm shadow-sm px-2">
        <div
          className="absolute bg-white transform bg-white rotate-45 border-gray-200 border-b border-l"
          style={{ width: '6px', height: '6px', left: '-4px', top: '9px' }}
        />
        {children}
      </div>
    </div>
  );
});
