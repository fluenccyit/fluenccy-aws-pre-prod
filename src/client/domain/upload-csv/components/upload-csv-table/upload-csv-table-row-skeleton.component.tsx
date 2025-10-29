import React, { memo } from 'react';
import { TextSkeleton, CircularSkeleton } from '@client/common';
import { UPLOAD_CSV_TABLE_SKELETON, UploadCSVTableCell } from '@client/upload-csv';

export const UploadCSVTableRowSkeleton = memo(() => {
  return (
    <tr className="bg-white border-t border-gray-400">
      <UploadCSVTableCell>
        <div className="flex flex-row items-center">
          <CircularSkeleton size="sm" className="mr-2" />
          <CircularSkeleton size="md" className="mr-2" />
          <TextSkeleton className="w-32 h-3" />
        </div>
      </UploadCSVTableCell>
      {[...Array(UPLOAD_CSV_TABLE_SKELETON.numCols - 1)].map((e, i) => (
        <UploadCSVTableCell key={i}>
          <TextSkeleton className="my-0.5 w-32 h-3" />
        </UploadCSVTableCell>
      ))}
    </tr>
  );
});
