import React, { memo, ReactNode } from 'react';
import cn from 'classnames';
import { Tabs, Icon } from '@client/common';

const BASE_CLASSES = ['flex', 'items-center', 'my-6', 'justify-center', 'px-6'];

const TABS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
  },
  {
    id: 'plan',
    label: 'Plan',
  },
  {
    id: 'pricing',
    label: 'Pricing',
  },
  {
    id: 'archives',
    label: 'Archives',
  },
  {
    id: 'trans',
    label: 'Transactions',
  },
];

type Props = {
  className?: string;
  onChangeTab: Function;
  selected: string;
};

export const Header = memo(({ onChangeTab, selected }: Props) => {
  return (
    <div className={cn(BASE_CLASSES)}>
      <Tabs tabs={TABS} initialTabId={selected || TABS[0].id} onChange={onChangeTab} tabStyle={{ minWidth: '130px', fontWeight: '500' }} />
    </div>
  );
});
