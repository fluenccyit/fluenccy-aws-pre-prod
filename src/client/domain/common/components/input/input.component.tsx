import React, { HTMLProps, ChangeEvent } from 'react';
import cn from 'classnames';

type Props = Omit<HTMLProps<HTMLInputElement>, 'onChange' | 'required' | 'disabled'> & {
  onChange: (event: ChangeEvent<HTMLInputElement>) => any;
  isDisabled?: boolean;
  isError?: boolean;
  isRequired?: boolean;
  'data-testid'?: DataTestidType;
};

const BASE_CLASSES = [
  'block',
  'border-gray-200',
  'border',
  'form-input',
  'placeholder-gray-300',
  'relative',
  'rounded-md',
  'shadow-sm',
  'sm:leading-5',
  'sm:text-sm',
  'w-full',
];

export const Input = ({ className, onChange, type = 'text', isError, isDisabled, isRequired, ...rest }: Props) => {
  const classes = cn(className, BASE_CLASSES, {
    'flnc-input--password': type === 'password',
    'border-red-300 placeholder-red-200 focus:border-red-300 focus:shadow-outline-red': isError,
    'opacity-50': isDisabled,
  });

  return <input {...rest} className={classes} onChange={onChange} type={type} disabled={isDisabled} required={isRequired} />;
};
