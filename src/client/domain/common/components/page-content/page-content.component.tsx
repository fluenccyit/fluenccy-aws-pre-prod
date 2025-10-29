import React, { ReactNode } from 'react';
import cn from 'classnames';

type Props = {
  className?: string;
  children: ReactNode;
  hasHeader?: boolean;
  hasPadding?: boolean;
  hasBanner?: boolean;
  isCentered?: boolean;
};

export const PageContent = ({ children, className, hasHeader = true, hasPadding = true, hasBanner, isCentered }: Props) => {
  const classes = cn(className, {
    'w-full': true,
    'flex items-center justify-center': isCentered,
    'px-4 pb-4 md:px-6 md:pb-6': hasPadding,
  });

  return <div className={classes}>{children}</div>;
};
