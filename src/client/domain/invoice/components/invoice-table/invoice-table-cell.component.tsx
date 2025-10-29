import React, { memo, ReactNode } from 'react';
import cn from 'classnames';

type Props = {
  className?: string;
  children: ReactNode;
  hasFlag?: boolean;
  truncateAfter?: string;
};

const BASE_CLASSES = 'whitespace-nowrap text-xs py-4 flex-grow-0 md:flex-grow';

export const InvoiceTableCell = memo(({ children, hasFlag, truncateAfter, className }: Props) => {
  const classes = cn(className, BASE_CLASSES, {
    'px-3 text-gray-900 flex flex-row items-center align-middle': hasFlag,
    'px-6 text-gray-500': !hasFlag,
    truncate: truncateAfter,
  });

  return (
    <td className={classes} style={truncateAfter ? { maxWidth: truncateAfter } : undefined} title={truncateAfter ? String(children) : undefined}>
      {children}
    </td>
  );
});
