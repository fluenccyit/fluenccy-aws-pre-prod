import React, { memo } from 'react';
import { TextSkeleton } from '@client/common';
import { UPLOAD_CSV_TABLE_SKELETON, UploadCSVTableRowSkeleton, UploadCSVTableHeaderCell } from '@client/upload-csv';

export const UploadCSVTableSkeleton = memo(() => (
  <div className="w-full flex flex-col mt-6" data-testid="flnc-invoice-table-skeleton">
    <div className="w-full align-middle inline-block min-w-full">
      <div className="w-full shadow border-b border-gray-200 sm:rounded-lg overflow-hidden">
        <table className="w-full divide-y divide-gray-200 border-collapse font-medium">
          <thead className="bg-gray-50">
            <tr>
              {[...Array(UPLOAD_CSV_TABLE_SKELETON.numCols)].map((e, i) => (
                <UploadCSVTableHeaderCell key={i}>
                  <TextSkeleton className="my-0.5 h-3 w-32" />
                </UploadCSVTableHeaderCell>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(UPLOAD_CSV_TABLE_SKELETON.numRows)].map((e, i) => (
              <UploadCSVTableRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
));
