import React, { ReactNode, HTMLProps, memo } from 'react';

type Props = HTMLProps<HTMLTableSectionElement> & {
  children: ReactNode;
  className?: string;
};

export const Tbody = memo(({ className, children, ...rest }: Props) => (
  <tbody {...rest} className={className}>
    {children}
  </tbody>
));
