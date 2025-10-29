import { UploadCSVTable, UploadCSVTableHeadingBar } from '@client/upload-csv';
import React, { memo } from 'react';

export const UploadCSVTableContainer = memo(({ mode }) => (
  <div className="w-full p-6">
    <UploadCSVTableHeadingBar />
    <UploadCSVTable mode={mode} />
  </div>
));
