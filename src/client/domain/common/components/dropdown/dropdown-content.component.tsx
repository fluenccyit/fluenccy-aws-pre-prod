import React, { ReactNode, MouseEvent as ReactMouseEvent, memo, AnchorHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import cn from 'classnames';

type AnchorClickEvent = (event: ReactMouseEvent<HTMLAnchorElement, MouseEvent>) => void;
type ButtonClickEvent = (event: ReactMouseEvent<HTMLButtonElement, MouseEvent>) => void;

type Props = {
  children: ReactNode;
  className?: string;
  to?: string;
  onClick?: AnchorClickEvent | ButtonClickEvent;
  isDisabled?: boolean;
  isExternal?: boolean;
  isOpenedInNewTab?: boolean;
};

const BASE_CLASSES = ['relative', 'block', 'border-b', 'border-gray-200', 'outline-none', 'w-full', 'p-4', 'first:rounded-t-md', 'last:rounded-b-md'];

export const DropdownContent = memo(({ children, className, to, onClick, isDisabled, isExternal, isOpenedInNewTab }: Props) => {
  const classes = cn(className, BASE_CLASSES, {
    'cursor-pointer hover:bg-gray-50': onClick || to,
    'pointer-events-none': isDisabled,
  });

  if (to) {
    if (isExternal) {
      const additionalAttrs: AnchorHTMLAttributes<HTMLAnchorElement> = {};

      if (isOpenedInNewTab) {
        additionalAttrs.target = '_blank';
        additionalAttrs.rel = 'noreferrer';
      }

      return (
        <a {...additionalAttrs} className={classes} href={to} onClick={onClick as AnchorClickEvent}>
          {children}
        </a>
      );
    }

    return (
      <Link className={classes} to={to} onClick={onClick as AnchorClickEvent}>
        {children}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button className={classes} onClick={onClick as ButtonClickEvent} type="button">
        {children}
      </button>
    );
  }

  return <div className={classes}>{children}</div>;
});
