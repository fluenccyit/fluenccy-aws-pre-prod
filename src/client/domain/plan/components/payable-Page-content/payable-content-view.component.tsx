import React, { memo, ReactNode } from 'react';
import cn from 'classnames';
import { Tabs, Icon } from '@client/common';

const BASE_CLASSES = ['flex', 'items-center', 'h-full', 'px-6'];

type Props = {
    className?: string;
    onChangeTab: Function;
    selected: string
};

export const PayableView= memo(({onChangeTab, selected}: Props) => {
    const TABS = [
        {
            id: 'optimised',
            label: 'Optimised',
            // prefixIcon: <Icon className="text-gray-900" icon="payables" />,
        }, {
            id: 'customised',
            label: 'Customised',
            // prefixIcon: <Icon className="text-gray-900" icon="payables" />,
        }
    ];

    return (
        <div className={cn(BASE_CLASSES)}>
            <Tabs  tabs={TABS} initialTabId={selected || TABS[0].id} onChange={onChangeTab} />
        </div>
    );
});
