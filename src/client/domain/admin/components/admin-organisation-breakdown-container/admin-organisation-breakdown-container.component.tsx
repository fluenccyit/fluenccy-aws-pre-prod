import React, { memo, ReactNode } from 'react';
import cn from 'classnames';

type Props = {
  children: ReactNode;
  className?: string;
};

const BASE_CLASSES = ['bg-gray-100', 'border-r', 'border-gray-200', 'min-w-organisation-breakdown', 'max-w-organisation-breakdown', 'p-6'];

export const AdminOrganisationBreakdownContainer = memo(({ children, className }: Props) => {
  const classes = cn(className, BASE_CLASSES);

  return <div className={classes}>{children}</div>;
});
