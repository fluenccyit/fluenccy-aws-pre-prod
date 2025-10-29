import React, { memo } from 'react';
import { TextSkeleton, CircularSkeleton } from '@client/common';
import { INVOICE_TABLE_SKELETON, PlanTableCell } from '@client/plan';

export const TableRowSkeleton = memo(({columns}) => {
  return (
    <tr className="bg-white border-t border-gray-400">
      {[...Array(columns)].map((e, i) => (
        <PlanTableCell key={i}>
          <TextSkeleton className="my-0.5 w-32 h-3" />
        </PlanTableCell>
      ))}
    </tr>
  );
});
