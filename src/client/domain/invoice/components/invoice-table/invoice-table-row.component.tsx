import React, { memo, useState, useRef, useEffect } from 'react';
import cn from 'classnames';
import { format } from 'date-fns';
import { PaymentDetails } from '@shared/payment';
import { useQueryLocalOrganisation } from '@client/organisation';
import { InvoiceTableRowChart, InvoiceTableCell } from '@client/invoice';
import { Badge, DATE_TIME_FORMAT, FlagIcon, Icon, useAnalytics, useQueryLocalCommon, utilService } from '@client/common';

// This is a temporary measure until we decide how to manage table cell widths and truncation.
const COMPANY_CELL_MAX_WIDTH = '150px';

type Props = {
  paymentDetails: PaymentDetails;
};

const BASE_CLASSES = ['bg-white', 'border-t', 'border-gray-400'];

export const InvoiceTableRow = memo(({ paymentDetails, mode }: Props) => {
  const chartWrapper = useRef<HTMLTableRowElement>(null);
  const { track } = useAnalytics();
  const { ui } = useQueryLocalCommon();
  const { organisation } = useQueryLocalOrganisation();

  // Chart width watchers etc to ensure that chart height stays static.
  const [chartWidth, setChartWidth] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleResize = () => {
    setChartWidth(chartWrapper?.current?.getBoundingClientRect().width || 0);
  };

  const { amount, budgetCost, contactName, currencyCode, dateDue, gainLoss, invoiceNumber, status } = paymentDetails;

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

  const handleToggle = () => {
    if (ui !== 'saving') {
      setIsExpanded(!isExpanded);

      // Only track the event when the row is expanded.
      if (!isExpanded) {
        track('paymentvariance_invoicelist_select', { invoiceNumber: paymentDetails.invoiceNumber });
      }
    }
  };

  return (
    <>
      <tr
        className={cn(BASE_CLASSES, ui === 'saving' ? 'pointer-events-none' : 'hover:bg-gray-100 cursor-pointer')}
        onClick={handleToggle}
        data-testid="flnc-invoice-table-row"
      >
        <InvoiceTableCell hasFlag>
          <button className={cn('mr-2 focus:outline-none', ui === 'saving' ? 'pointer-events-none' : 'cursor-pointer')}>
            <Icon className="text-gray-500" icon={isExpanded ? 'carat-up' : 'carat-down'} />
          </button>
          <FlagIcon className="mr-3" currency={currencyCode} />
          <span className="font-medium">{`${utilService.formatCurrencyAmount(amount, currencyCode)}`}</span>
        </InvoiceTableCell>
        <InvoiceTableCell>{invoiceNumber ? invoiceNumber : '-'}</InvoiceTableCell>
        <InvoiceTableCell truncateAfter={COMPANY_CELL_MAX_WIDTH}>{contactName}</InvoiceTableCell>
        <InvoiceTableCell>{format(dateDue, DATE_TIME_FORMAT.invoiceTable)}</InvoiceTableCell>
        <InvoiceTableCell>{`${utilService.formatCurrencyAmount(budgetCost, organisation.currency)}`}</InvoiceTableCell>
        <InvoiceTableCell>
          <Badge variant={gainLoss >= 0 ? 'success' : 'danger'} size="sm" isRounded>
            {utilService.formatAmount(gainLoss)}
          </Badge>
        </InvoiceTableCell>
        <InvoiceTableCell className="capitalize">
          {mode ? (status === 'partial' ? 'Partial Received' : 'Received') : status === 'partial' ? 'Partial Payment' : 'Paid'}
        </InvoiceTableCell>
      </tr>
      {isExpanded && (
        <tr ref={chartWrapper} data-testid="flnc-invoice-table-row-chart">
          <InvoiceTableRowChart paymentDetails={paymentDetails} chartWidth={chartWidth} mode={mode} />
        </tr>
      )}
    </>
  );
});
