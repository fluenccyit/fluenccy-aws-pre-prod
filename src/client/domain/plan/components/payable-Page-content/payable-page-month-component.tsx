import React, { memo } from 'react';
import cn from 'classnames';
import { Tabs, Icon } from '@client/common';

const BASE_CLASSES = ['flex', 'items-center', 'border-r', 'border-gray-200', 'h-full', 'px-6'];

type Props = {
    onChange: Function;
    month: string;
}
export const PayableMonth = memo(({onChange, month}: Props) => {
    const TABS = [
        {
            id: '1month',
            label: '1 month',
            // prefixIcon: <Icon className="text-gray-900" icon="payables" />,
        }, {
            id: '3months',
            label: '3 months',
            // prefixIcon: <Icon className="text-gray-900" icon="payables" />,
        }, {
            id: '6months',
            label: '6 months',
            // prefixIcon: <Icon className="text-gray-900" icon="payables" />,
        }, {
            id: '12months',
            label: '12 months',
            // prefixIcon: <Icon className="text-gray-900" icon="payables" />,
        },
    ];

    return (
        <div className={cn(BASE_CLASSES)}>
            <Tabs tabs={TABS} initialTabId={month || TABS[TABS.length-1].id} onChange={onChange} variant="pill" />
        </div>
    );
});
