import React, { memo, ReactNode } from 'react';
import cn from 'classnames';
import { matchPath, NavLink } from 'react-router-dom';
import { Button, Text } from '@client/common';

type Props = {
  children: ReactNode;
  className?: string;
  to: string;
  variant?: 'dark' | 'light';
  hasActiveState?: boolean;
  activeRoutes?: string[];
  isExternal?: boolean;
};

const BASE_CLASSES = [
  'flex',
  'flex-col',
  'border-solid',
  'justify-center',
  'border-transparent',
  'whitespace-nowrap',
  'border-b-2',
  'items-center',
  'h-14',
  'md:h-20',
];
const BASE_ACTIVE_CLASSES = ['border-solid', 'border-green-500', 'border-b-2'];

export const HeaderNavLink = memo(({ children, className, to, hasActiveState = true, variant = 'light', activeRoutes, isExternal }: Props) => {
  const classes = cn(className, BASE_CLASSES);
  const activeClasses = cn(BASE_ACTIVE_CLASSES);
  const handleIsActive = () => Boolean(matchPath(location.pathname, activeRoutes || []));

  if (isExternal) {
    return (
      <Button className={classes} state="text" variant="light" href={to} isOpenedInNewTab isExternal isLink>
        <Text variant={variant}>{children}</Text>
      </Button>
    );
  }

  return (
    <NavLink className={classes} activeClassName={hasActiveState ? activeClasses : ''} to={to} isActive={activeRoutes && handleIsActive}>
      <Text variant={variant}>{children}</Text>
    </NavLink>
  );
});
