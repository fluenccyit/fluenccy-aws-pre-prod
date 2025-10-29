import { InvoiceTable, InvoiceTableHeadingBar } from '@client/invoice';
import React, { memo } from 'react';

export const InvoiceTableContainer = memo(({ mode }) => (
  <div className="w-full p-6">
    <InvoiceTableHeadingBar mode={mode} />
    <InvoiceTable mode={mode} />
  </div>
));
