import React, { memo, useState, useRef, useEffect } from 'react';
import cn from 'classnames';
import { format } from 'date-fns';
import { PaymentDetails } from '@shared/payment';
import { ObjectIterator, orderBy, PartialShallow, PropertyName } from 'lodash';
import { useQueryLocalOrganisation } from '@client/organisation';
import { UploadCSVTableRowChart, UploadCSVTableCell } from '@client/upload-csv';
import { Badge, DATE_TIME_FORMAT, FlagIcon, Icon, useAnalytics, useQueryLocalCommon, utilService } from '@client/common';
import { UploadDataLogs } from '@shared/upload-csv';
import Moment from 'moment';
import { useHistory } from 'react-router';
// This is a temporary measure until we decide how to manage table cell widths and truncation.
const COMPANY_CELL_MAX_WIDTH = '150px';

type Props = {
  uploadLogs: UploadDataLogs;
  index: String;
  onDelete: Function
};

const BASE_CLASSES = ['bg-white', 'border-t', 'border-gray-400'];

export const UploadCSVTableRow = memo(({ uploadLogs, index, onDelete }: Props) => {
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

  const { id, created_at, filename, fileType, review_status } = uploadLogs;

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

  // const handleToggle = () => {
  //   if (ui !== 'saving') {
  //     setIsExpanded(!isExpanded);

  //     // Only track the event when the row is expanded.
  //     if (!isExpanded) {
  //       track('paymentvariance_invoicelist_select', { invoiceNumber: paymentDetails.invoiceNumber });
  //     }
  //   }
  // };

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
  const isInPlanPage = history.location.pathname.includes('/plan');
  const isInCurrencyManagementPage = history.location.pathname.includes('/currency-management');

  const editPath = isInPlanPage ? `/plan/upload-csv/details/edit/${id}` : isInCurrencyManagementPage ? `/currency-management/upload-csv/details/edit/${id}` : `/upload-csv/details/edit/${id}`;
  const viewPath = isInPlanPage ? `/plan/upload-csv/details/${id}` : isInCurrencyManagementPage ? `/currency-management/upload-csv/details/${id}` : `/upload-csv/details/${id}`;
  return (
    <>
      <tr
        className={cn(BASE_CLASSES, ui === 'saving' ? 'pointer-events-none' : 'hover:bg-gray-100 cursor-pointer')}
        // onClick={handleToggle}
        data-testid="flnc-invoice-table-row"
      >
        <UploadCSVTableCell>{index ? index : '-'}</UploadCSVTableCell>
        <UploadCSVTableCell>{created_at ? Moment(created_at).format('DD-MM-YYYY') : '-'}</UploadCSVTableCell>
        <UploadCSVTableCell>{filename ? filename : '-'}</UploadCSVTableCell>

        <UploadCSVTableCell>{fileType ? fileType : '-'}</UploadCSVTableCell>

        <UploadCSVTableCell>
          { }
          <Badge variant={variantVal} size="sm" isRounded>
            {review_status ? review_status : '-'}
          </Badge>
        </UploadCSVTableCell>
        <UploadCSVTableCell>
          {review_status.toLowerCase() !== 'imported' && (
            <a href={editPath} title="Edit">
              <Icon className="mr-2" icon="edit" />
            </a>
          )}
          <a href={viewPath} title="View Details">
            <Icon className="mr-2" icon="view" title="Edit" />
          </a>
          <a onClick={() => onDelete(uploadLogs)} title="Delete">
            <Icon className="mr-2" icon="delete" title="Delete" />
          </a>
          {/* <Icon className="mr-2" icon="delete" /> */}
        </UploadCSVTableCell>
      </tr>
    </>
  );
});
