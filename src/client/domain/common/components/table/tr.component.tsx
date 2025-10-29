import React, { ReactNode, HTMLProps, memo } from 'react';
import cn from 'classnames';

type Props = HTMLProps<HTMLTableRowElement> & {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  isFirst?: boolean;
  variant?: 'thead' | 'tbody';
};

const BASE_CLASSES = ['bg-white'];

export const Tr = memo(({ className, children, onClick, isFirst, variant = 'tbody', ...rest }: Props) => {
  const classes = cn(className, BASE_CLASSES, {
    'hover:bg-gray-100 cursor-pointer': onClick,
    'border-t border-gray-400': !isFirst,
    'bg-white': variant === 'tbody',
    'bg-gray-50': variant === 'thead',
  });

  return (
    <tr {...rest} className={classes} onClick={onClick}>
      {children}
    </tr>
  );
});
