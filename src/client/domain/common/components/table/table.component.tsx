import React, { ReactNode, HTMLProps, memo } from 'react';
import cn from 'classnames';

type Props = HTMLProps<HTMLTableElement> & {
  children: ReactNode;
  className?: string;
};

const BASE_CLASSES = ['w-full', 'border-collapse'];

export const Table = memo(({ className, children, ...rest }: Props) => {
  const classes = cn(className, BASE_CLASSES);

  return (
    <table {...rest} className={classes}>
      {children}
    </table>
  );
});
