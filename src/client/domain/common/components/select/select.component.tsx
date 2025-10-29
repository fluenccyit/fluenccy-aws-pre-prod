import React, { HTMLProps, memo } from 'react';
import cn from 'classnames';
import { map } from 'lodash';

export type SelectOption<T = string> = {
  label: string;
  value: T;
};

type Props = Omit<HTMLProps<HTMLSelectElement>, 'onChange' | 'required' | 'disabled'> & {
  onChange: (value: SelectOption['value']) => void;
  options: SelectOption[];
  isDisabled?: boolean;
  isError?: boolean;
  isRequired?: boolean;
};

const BASE_CLASSES = [
  'block',
  'form-select',
  'border-gray-200',
  'border',
  'relative',
  'placeholder-gray-300',
  'rounded-md',
  'shadow-sm',
  'w-full',
  'sm:leading-5',
  'sm:text-sm',
];

export const Select = memo(({ options, className, onChange, isError, isDisabled, isRequired, value, selected, ...rest }: Props) => {
  const classes = cn(className, BASE_CLASSES, {
    'border-red-300 focus:border-red-300 focus:shadow-outline-red': isError,
    'opacity-50': isDisabled,
  });

  return (
    <select
      {...rest}
      className={classes}
      onChange={({ target }) => onChange(target.value)}
      value={value}
      disabled={isDisabled}
      required={isRequired}
      // defaultValue={selected}
    >
      {map(options, ({ label, value }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
});
