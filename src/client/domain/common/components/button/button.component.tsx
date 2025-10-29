import React, { AnchorHTMLAttributes, HTMLProps, memo, MouseEvent as ReactMouseEvent } from 'react';
import cn from 'classnames';
import { Link } from 'react-router-dom';

type AnchorClickEvent = (event: ReactMouseEvent<HTMLAnchorElement, MouseEvent>) => void;
type ButtonClickEvent = (event: ReactMouseEvent<HTMLButtonElement, MouseEvent>) => void;

type Props = Omit<HTMLProps<HTMLButtonElement>, 'disabled' | 'state'> & {
  href?: string | object;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'dark' | 'gray' | 'light' | 'success' | 'warning' | 'danger' | 'info' | 'xero-blue' | 'cancel';
  state?: 'filled' | 'outline' | 'text';
  onClick?: AnchorClickEvent | ButtonClickEvent;
  isDisabled?: boolean;
  isExternal?: boolean;
  isLink?: boolean;
  isRounded?: boolean;
  isOpenedInNewTab?: boolean;
  'data-testid'?: DataTestidType;
};

const BASE_CLASSES = ['inline-flex', 'flex-shrink-0', 'items-center', 'focus:outline-none', 'outline-none'];
const BASE_TEXT_CLASSES = ['background-transparent', 'font-normal'];
const BASE_FILLED_CLASSES = ['px-4', 'py-2', 'justify-center', 'focus:ring-2', 'focus:ring-offset-2', 'hover:opacity-80', 'md:px-9'];
const BASE_OUTLINE_CLASSES = [...BASE_FILLED_CLASSES, 'bg-transparent', 'border-solid', 'border'];

export const Button = memo((props: Props) => {
  const {
    children,
    className,
    href,
    onClick,
    state = 'filled',
    type = 'button',
    variant = 'success',
    isDisabled,
    isExternal,
    isLink,
    isOpenedInNewTab,
    isRounded,
    'data-testid': dataTestid,
    ...rest
  } = props;
  let classes = cn(className, BASE_CLASSES, {
    'pointer-events-none opacity-50': isDisabled,
    'rounded-full': isRounded,
    'rounded-md': !isRounded,
  });
  const isDark = variant === 'dark';
  const isGray = variant === 'gray';
  const isLight = variant === 'light';
  const isSuccess = variant === 'success';
  const isWarning = variant === 'warning';
  const isDanger = variant === 'danger';
  const isInfo = variant === 'info';
  const isXeroBlue = variant === 'xero-blue';
  const isCancel = variant === 'cancel';

  if (state === 'filled') {
    classes = cn(classes, BASE_FILLED_CLASSES, {
      'bg-gray-900 text-white active:bg-gray-900 focus:ring-color-gray-900': isDark,
      'bg-gray-200 active:bg-gray-300 focus:ring-color-gray-200': isGray,
      'bg-white text-gray-900 active:bg-white focus:ring-color-white': isLight,
      'bg-green-500 text-white active:bg-green-600 focus:ring-color-green-500': isSuccess,
      'bg-orange-500 text-white active:bg-orange-600 focus:ring-color-orange-500': isWarning,
      'bg-red-500 text-white active:bg-red-600 focus:ring-color-red-500': isDanger,
      'bg-blue-500 text-white active:bg-blue-600 focus:ring-color-blue-500': isInfo,
      'bg-xero-blue text-white active:bg-xero-blue-dark focus:ring-color-xero-blue': isXeroBlue,
    });
  }

  if (state === 'outline') {
    classes = cn(classes, BASE_OUTLINE_CLASSES, {
      'border-gray-900 text-gray-900 focus:ring-color-gray-900': isDark,
      'border-gray-200 text-gray-200 focus:ring-color-gray-200': isGray,
      'border-white text-white focus:ring-color-white': isLight,
      'border-green-500 text-green-500 active:text-green-600 focus:ring-color-green-500': isSuccess,
      'border-orange-500 text-orange-500 focus:ring-color-orange-500': isWarning,
      'border-red-500 text-red-500 focus:ring-color-red-500': isDanger,
      'border-blue-500 text-blue-500 focus:ring-color-blue-500': isInfo,
      'border-xero-blue text-xero-blue active:text-xero-blue-dark focus:ring-color-xero-blue': isXeroBlue,
    });
  }

  if (state === 'text') {
    classes = cn(classes, BASE_TEXT_CLASSES, {
      'text-gray-900 hover:text-gray-500': isDark,
      'text-gray-500 hover:text-gray-400': isGray,
      'text-white hover:text-gray-100': isLight,
      'text-green-500 hover:text-green-400': isSuccess,
      'text-orange-500 hover:text-orange-400': isWarning,
      'text-red-500 hover:text-red-400': isDanger,
      'text-blue-500 hover:text-blue-600': isInfo,
      'text-xero-blue hover:text-xero-blue-dark': isXeroBlue,
    });
  }

  if (isLink && href) {
    if (isExternal) {
      const additionalAttrs: AnchorHTMLAttributes<HTMLAnchorElement> = {};

      if (isOpenedInNewTab) {
        additionalAttrs.target = '_blank';
        additionalAttrs.rel = 'noreferrer';
      }

      return (
        <a {...additionalAttrs} className={classes} href={href} onClick={onClick as AnchorClickEvent} data-testid={dataTestid}>
          {children}
        </a>
      );
    }

    return (
      <Link className={classes} to={href} onClick={onClick as AnchorClickEvent} data-testid={dataTestid}>
        {children}
      </Link>
    );
  }

  return (
    <button {...rest} className={classes} type={type} disabled={isDisabled} onClick={onClick as ButtonClickEvent} data-testid={dataTestid}>
      {children}
    </button>
  );
});
