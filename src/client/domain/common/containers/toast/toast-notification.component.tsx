import React, { memo, ReactNode } from 'react';
import ReactDOM from 'react-dom';
import cn from 'classnames';
import { Button, Icon, useToast } from '@client/common';

export type ToastVariant = 'success' | 'danger';

export type ToastProps = {
  className?: string;
  children: ReactNode;
  variant: ToastVariant;
};

const BASE_CLASSES = [
  'right-6',
  'top-11',
  'flex',
  'items-start',
  'max-w-sm',
  'w-full',
  'bg-white',
  'border',
  'border-gray-200',
  'overflow-hidden',
  'rounded-lg',
  'shadow-md',
  'p-4',
  'z-toast',
];

export const ToastNotification = memo(({ className, children, variant }: ToastProps) => {
  const { removeToast } = useToast();
  const classes = cn(BASE_CLASSES, className, {
    'border-green-400': variant === 'success',
    'border-red-500': variant === 'danger',
  }, className?.includes('fixed') ? 'fixed' : 'absolute');

  const renderIcon = () => {
    switch (variant) {
      case 'success':
        return <Icon className="text-green-500" icon="tick-circle-outlined" />;
      case 'danger':
        return <Icon className="text-red-500" icon="error-circle-outlined" />;
    }
  };

  return ReactDOM.createPortal(
    <div className={classes}>
      <div className="flex-shrink-0 mr-3">{renderIcon()}</div>
      <div className="flex-1">{children}</div>
      <div className="ml-4 flex-shrink-0">
        <Button state="text" onClick={removeToast}>
          <Icon className="text-gray-500" icon="close" />
        </Button>
      </div>
    </div>,
    document.body
  );
});
