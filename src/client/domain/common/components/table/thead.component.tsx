import React, { ReactNode, HTMLProps, memo } from 'react';
import cn from 'classnames';
import { Tr } from './tr.component';

type Props = HTMLProps<HTMLTableSectionElement> & {
  children: ReactNode;
  className?: string;
};

const BASE_CLASSES = ['bg-gray-50'];

export const Thead = memo(({ className, children, ...rest }: Props) => {
  const classes = cn(className, BASE_CLASSES);

  return (
    <thead {...rest} className={classes}>
      <Tr variant="thead" isFirst>
        {children}
      </Tr>
    </thead>
  );
});
