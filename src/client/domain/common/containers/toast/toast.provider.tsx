import React, { useState, useCallback, memo, ReactNode, useContext, useMemo, createContext } from 'react';
import { ToastNotification, ToastProps, ToastVariant } from '@client/common';

export type ToastContext = {
  addToast(content: ReactNode, variant?: ToastVariant, className?: string): void;
  removeToast(): void;
};

const ToastContext = createContext<ToastContext | null>(null);

// Auto dismiss toasts after 3 seconds.
const TOAST_DISMISS_TIMEOUT = 3000;

type Props = {
  children: ReactNode;
};

// @TODO handle multiple toasts
export const ToastProvider = memo(({ children }: Props) => {
  const [openToast, setOpenToast] = useState<ToastProps | null>(null);
  const [timer, setTimer] = useState<NodeJS.Timeout>();

  const addToast = useCallback(
    (children: ReactNode, variant: ToastVariant = 'success', className: string = 'fixed') => {
      clearTimeout(timer as NodeJS.Timeout);

      setOpenToast({ children, variant, className });

      if (variant === 'success') {
        const timer = setTimeout(() => {
          setOpenToast(null);
        }, TOAST_DISMISS_TIMEOUT);

        setTimer(timer);
      }
    },
    [timer]
  );

  const removeToast = useCallback(() => {
    clearTimeout(timer as NodeJS.Timeout);
    setOpenToast(null);
  }, [timer]);

  const renderToast = () => {
    if (!openToast) {
      return null;
    }

    const { children, variant = 'success', className } = openToast;

    return (
      <ToastNotification className={className} variant={variant}>
        {children}
      </ToastNotification>
    );
  };

  const memoizedContextValue = useMemo(
    () => ({
      addToast,
      removeToast,
    }),
    [openToast]
  );

  return (
    <ToastContext.Provider value={memoizedContextValue}>
      {children}
      {renderToast()}
    </ToastContext.Provider>
  );
});

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('This component must be used within a <ToastProvider> component.');
  }

  return context;
};
