import React from 'react';
import cn from 'classnames';

type Props = {
  className?: string;
  onChange: (isChecked: boolean) => void;
  isChecked?: boolean;
  isDisabled?: boolean;
  'data-testid'?: DataTestidType;
};

const BASE_CLASSES = [
  'bg-gray-200',
  'border-2',
  'border-transparent',
  'cursor-pointer',
  'duration-200',
  'ease-in-out',
  'flex-shrink-0',
  'focus:outline-none',
  'focus:ring-2',
  'focus:ring-indigo-500',
  'focus:ring-offset-2',
  'h-6',
  'inline-flex',
  'relative',
  'rounded-full',
  'transition-colors',
  'w-11',
];

const BASE_SWITCH_CLASSES = [
  'bg-white',
  'ease-in-out duration-200',
  'inline-block',
  'pointer-events-none',
  'ring-0',
  'rounded-full',
  'shadow',
  'transform',
  'transition',
  'translate-x-0',
  'h-5',
  'w-5',
];

export const Toggle = ({ className, onChange, isChecked, isDisabled, 'data-testid': dataTestid }: Props) => {
  const classes = cn(className, BASE_CLASSES, {
    'bg-green-500': isChecked,
    'opacity-50 pointer-events-none': isDisabled,
  });
  const switchClasses = cn(BASE_SWITCH_CLASSES, { 'translate-x-5': isChecked });

  return (
    <button
      className={classes}
      onClick={() => onChange(!isChecked)}
      type="button"
      role="switch"
      aria-checked={isChecked}
      data-testid={dataTestid}
      disabled={isDisabled}
    >
      <div className={switchClasses} />
    </button>
  );
};
