import React, { memo } from 'react';
import cn from 'classnames';
import { Tabs, Icon } from '@client/common';

const BASE_CLASSES = ['flex', 'items-center', 'border-r', 'border-gray-200', 'h-full', 'px-6'];

export const PayableReceivable = memo(({ onChange, selected }) => {
  const TABS = [
    {
      id: 'payables',
      label: 'Payables',
      prefixIcon: <Icon className="text-gray-900" icon="payables" />,
    },
    {
      id: 'receivables',
      label: 'Receivables',
      prefixIcon: <Icon className="text-gray-900" icon="payables" />,
    },
  ];

  return (
    <div className={cn(BASE_CLASSES)}>
      <Tabs onChange={onChange} tabs={TABS} initialTabId={selected || TABS[0].id} variant="underline" />
    </div>
  );
});
