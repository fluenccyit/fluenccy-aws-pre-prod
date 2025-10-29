import React, { memo } from 'react';
import { TextSkeleton } from '@client/common';
import { INVOICE_TABLE_SKELETON, InvoiceTableRowSkeleton, InvoiceTableHeaderCell } from '@client/invoice';

export const InvoiceTableSkeleton = memo(() => (
  <div className="w-full flex flex-col mt-6" data-testid="flnc-invoice-table-skeleton">
    <div className="w-full align-middle inline-block min-w-full">
      <div className="min-w-invoice-table w-full shadow border-b border-gray-200 sm:rounded-lg overflow-hidden">
        <table className="w-full divide-y divide-gray-200 border-collapse font-medium">
          <thead className="bg-gray-50">
            <tr>
              {[...Array(INVOICE_TABLE_SKELETON.numCols)].map((e, i) => (
                <InvoiceTableHeaderCell key={i}>
                  <TextSkeleton className="my-0.5 h-3 w-32" />
                </InvoiceTableHeaderCell>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(INVOICE_TABLE_SKELETON.numRows)].map((e, i) => (
              <InvoiceTableRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
));
