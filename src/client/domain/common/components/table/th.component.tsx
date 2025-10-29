import React, { ReactNode, HTMLProps, memo } from 'react';
import cn from 'classnames';

type Props = HTMLProps<HTMLTableCellElement> & {
  children?: ReactNode;
  className?: string;
};

const BASE_CLASSES = ['font-medium', 'text-left', 'text-xs', 'text-gray-500', 'tracking-wider', 'whitespace-nowrap', 'uppercase', 'px-6', 'py-3'];

export const Th = memo(({ className, children, ...rest }: Props) => {
  const classes = cn(className, BASE_CLASSES);

  return (
    <th {...rest} className={classes}>
      {children}
    </th>
  );
});
