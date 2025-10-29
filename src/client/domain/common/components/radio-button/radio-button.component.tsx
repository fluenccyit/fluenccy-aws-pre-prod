import React, { ReactNode } from 'react';
import cn from 'classnames';
import { Icon } from '@client/common';

type Props<T> = {
  className?: string;
  children: ReactNode;
  onChange: (value: T) => void;
  name: string;
  value: T;
  isSelected?: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  'data-testid'?: DataTestidType;
  displayIcon?: boolean;
};

const BASE_CLASSES = ['relative', 'block', 'rounded-lg', 'border', 'bg-white', 'text-sm', 'text-gray-550', 'pl-6', 'pr-10', 'py-4', 'cursor-pointer'];

export function RadioButton<T>({
  isSelected,
  isDisabled,
  isRequired,
  children,
  name,
  className,
  onChange,
  value,
  'data-testid': dataTestid,
  displayIcon = false,
}: Props<T>) {
  const classes = cn(BASE_CLASSES, className, {
    'opacity-50 pointer-events-none': isDisabled,
    'bg-gray-200 border-0': isSelected,
    'border-gray-300': !isSelected,
  });

  return (
    <label className={displayIcon ? className : classes} data-testid={dataTestid}>
      <input
        className={cn({ 'sr-only': !displayIcon, 'mr-2': displayIcon })}
        onChange={() => onChange(value)}
        type="radio"
        name={name}
        checked={isSelected}
        required={isRequired}
        disabled={isDisabled}
      />
      {children}
      {!displayIcon && isSelected && (
        <Icon className="absolute top-1/2 right-4 transform -translate-y-1/2 text-green-500" icon="tick-circle-filled" />
      )}
    </label>
  );
}
