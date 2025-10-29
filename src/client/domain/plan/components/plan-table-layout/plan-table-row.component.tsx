import React, { memo, useState, useRef, useEffect } from 'react';
import cn from 'classnames';
import { format } from 'date-fns';
import { PaymentDetails } from '@shared/payment';
import { useQueryLocalOrganisation } from '@client/organisation';
import { PlanTableCell } from '@client/plan';
import { Badge, DATE_TIME_FORMAT, FlagIcon, Icon, useAnalytics, useQueryLocalCommon, utilService } from '@client/common';
import { UploadDataLogs } from '@shared/upload-csv';
import Moment from 'moment';
import { useHistory } from 'react-router';
// This is a temporary measure until we decide how to manage table cell widths and truncation.
const COMPANY_CELL_MAX_WIDTH = '150px';

type Props = {
    uploadLogs: UploadDataLogs;
    index: String;
};

const BASE_CLASSES = ['bg-white', 'border-t', 'border-gray-400'];

export const PlanTableRow = memo(({ uploadLogs, index }: Props) => {
    const chartWrapper = useRef<HTMLTableRowElement>(null);
    const { track } = useAnalytics();
    const history = useHistory();
    const { ui } = useQueryLocalCommon();
    const { organisation } = useQueryLocalOrganisation();

    // Chart width watchers etc to ensure that chart height stays static.
    const [chartWidth, setChartWidth] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleResize = () => {
        setChartWidth(chartWrapper?.current?.getBoundingClientRect().width || 0);
    };

    const { id, created_at, fileName, fileType, review_status } = uploadLogs;

    useEffect(() => {
        setChartWidth(chartWrapper?.current?.getBoundingClientRect().width || 0);
        window.addEventListener('resize', handleResize, true);

        return () => {
            window.removeEventListener('resize', handleResize, true);
        };
    }, [isExpanded]);

    if (!organisation) {
        return null;
    }

  

    var icons = `
  .e-search:before {
      content:'\\e993';
  }
  .e-upload:before {
      content: '\\e725';
  }
  .e-font:before {
      content: '\\e34c';
  }
  `;

    const variantVal = review_status == 'Uploaded' ? 'danger' : review_status == 'Draft Saved' ? 'gray' : 'success';

    return (
        <>
            <tr
                className={cn(BASE_CLASSES, ui === 'saving' ? 'pointer-events-none' : 'hover:bg-gray-100 cursor-pointer')}
                // onClick={handleToggle}
                data-testid="flnc-invoice-table-row"
            >
                <PlanTableCell>{index ? index : '-'}</PlanTableCell>
                <PlanTableCell>{created_at ? Moment(created_at).format('DD-MM-YYYY') : '-'}</PlanTableCell>
               
            </tr>
        </>
    );
});
