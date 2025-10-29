import React, { HTMLProps, ChangeEvent } from 'react';
import cn from 'classnames';

type Props = Omit<HTMLProps<HTMLTextAreaElement>, 'onChange' | 'required' | 'disabled'> & {
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => any;
  isDisabled?: boolean;
  isError?: boolean;
  isRequired?: boolean;
};

const BASE_CLASSES = [
  'block',
  'border-gray-200',
  'border',
  'form-textarea',
  'placeholder-gray-300',
  'relative',
  'rounded-md',
  'shadow-sm',
  'w-full',
  'sm:leading-5',
  'sm:text-sm',
];

export const TextArea = ({ className, onChange, rows, isError, isDisabled, isRequired, ...rest }: Props) => {
  const classes = cn(className, BASE_CLASSES, {
    'border-red-300 placeholder-red-200 focus:border-red-300 focus:shadow-outline-red': isError,
    'opacity-50': isDisabled,
  });

  return (
    <textarea {...rest} className={classes} onChange={onChange} style={{ resize: 'none' }} rows={rows} disabled={isDisabled} required={isRequired} />
  );
};
