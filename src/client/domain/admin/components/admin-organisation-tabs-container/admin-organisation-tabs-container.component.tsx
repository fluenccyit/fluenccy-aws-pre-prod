import React, { memo, ReactNode } from 'react';
import cn from 'classnames';

type Props = {
  children: ReactNode;
  className?: string;
};

const BASE_CLASSES = ['w-full', 'flex', 'flex-col', 'overflow-x-auto', 'bg-white'];

export const AdminOrganisationTabsContainer = memo(({ children, className }: Props) => {
  const classes = cn(className, BASE_CLASSES);

  return <div className={classes}>{children}</div>;
});
