import React, { memo } from 'react';
import { TextSkeleton } from '@client/common';
import { INVOICE_TABLE_SKELETON, PlanTableHeaderCell, TableRowSkeleton } from '@client/plan';

export const PlanTableSkeleton = memo(({ rows, columns }) => (
  <div className="w-full flex flex-col" data-testid="flnc-invoice-table">
    <div className="w-full align-middle inline-block min-w-full">
      <div className="w-full shadow border-b border-gray-200 sm:rounded-lg overflow-x-auto">
        <table className="w-full divide-y divide-gray-200 border-collapse font-medium overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              {[...Array(columns)].map((e, i) => (
                <PlanTableHeaderCell key={i}>
                  <TextSkeleton className="my-0.5 h-3 w-32" />
                </PlanTableHeaderCell>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(rows)].map((e, i) => (
              <TableRowSkeleton key={i} columns={columns} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
));
