import React, { ReactNode, memo } from 'react';

type Props = {
  children: ReactNode;
};

export const PlanTableHeaderCell = memo(({ children }: Props) => {
  return (
    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      {children}
    </th>
  );
});
