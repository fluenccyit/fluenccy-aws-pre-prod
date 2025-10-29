import React, { ReactNode, HTMLProps, memo } from 'react';
import classNames from 'classnames';

type Props = HTMLProps<HTMLTableCellElement> & {
  children: ReactNode;
  className?: string;
};

const BASE_CLASSES = ['whitespace-nowrap', 'text-sm', 'relative', 'px-6', 'py-4'];

export const Td = memo(({ className, children, ...rest }: Props) => {
  const classes = classNames(className, BASE_CLASSES);

  return (
    <td {...rest} className={classes}>
      {children}
    </td>
  );
});
