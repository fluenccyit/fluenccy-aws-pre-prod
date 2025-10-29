import React, { ChangeEvent, HTMLProps, forwardRef } from 'react';
import cn from 'classnames';

type Props = Omit<HTMLProps<HTMLInputElement>, 'onChange' | 'required' | 'disabled'> & {
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  className?: string;
  isChecked?: boolean;
  isDisabled?: boolean;
};

const BASE_CLASSES = [
  'form-checkbox',
  'border',
  'border-gray-300',
  'transition',
  'duration-150',
  'ease-in-out',
  'rounded-md',
  'cursor-pointer',
  'h-5',
  'w-5',
  'checked:bg-blue-500',
  'checked:border-blue-500',
  'checked:bg-green-500',
  'checked:border-green-500',
  'focus:ring-2',
  'focus:ring-green-200',
  'focus:border-green-300',
];

export const Checkbox = forwardRef<HTMLInputElement, Props>(({ id, className, onChange, isChecked, isDisabled }: Props, ref) => {
  const classes = cn(className, BASE_CLASSES, {
    'opacity-50 pointer-events-none': isDisabled,
  });

  return <input ref={ref} id={id} className={classes} type="checkbox" onChange={onChange} checked={isChecked} disabled={isDisabled} />;
});
