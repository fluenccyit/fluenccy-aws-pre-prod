import React, { memo } from 'react';
import { TextSkeleton, CircularSkeleton } from '@client/common';
import { INVOICE_TABLE_SKELETON, InvoiceTableCell } from '@client/invoice';

export const InvoiceTableRowSkeleton = memo(() => {
  return (
    <tr className="bg-white border-t border-gray-400">
      <InvoiceTableCell>
        <div className="flex flex-row items-center">
          <CircularSkeleton size="sm" className="mr-2" />
          <CircularSkeleton size="md" className="mr-2" />
          <TextSkeleton className="w-32 h-3" />
        </div>
      </InvoiceTableCell>
      {[...Array(INVOICE_TABLE_SKELETON.numCols - 1)].map((e, i) => (
        <InvoiceTableCell key={i}>
          <TextSkeleton className="my-0.5 w-32 h-3" />
        </InvoiceTableCell>
      ))}
    </tr>
  );
});
