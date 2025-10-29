import React, { useRef } from 'react';
import { format } from 'date-fns';
import { VictoryProps } from '@client/chart';
import { useQueryLocalOrganisation } from '@client/organisation';
import { DATE_TIME_FORMAT, utilService, Text } from '@client/common';

const TOOLTIP_X_OFFSET = 5;
const TOOLTIP_Y_OFFSET = -30;

export const InvoiceTableRowChartTooltip = ({ x = 0, y = 0, index, datum, mode }: VictoryProps) => {
  const { organisation } = useQueryLocalOrganisation();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const isFirst = !index;

  if (!organisation) {
    return null;
  }

  const getTooltipStyle = () => {
    if (isFirst) {
      return { top: TOOLTIP_Y_OFFSET, left: TOOLTIP_X_OFFSET };
    } else {
      return { top: TOOLTIP_Y_OFFSET, right: TOOLTIP_X_OFFSET };
    }
  };

  return (
    <foreignObject className="overflow-visible" x={x} y={y}>
      <div className="absolute flex" style={getTooltipStyle()} ref={tooltipRef}>
        <div className="flex items-center bg-white rounded-lg overflow-hidden shadow-sm">
          <div className="flex items-center justify-between rounded-l-lg bg-gray-900 border-gray-900 border whitespace-nowrap py-1 px-2">
            <Text className="text-sm font-bold mr-1" variant="light" isBlock>
              {isFirst ? 'Raised' : mode ? 'Received' : 'Paid'}:
            </Text>
            <Text className="text-sm" variant="light" isBlock>
              {format(datum?.date, DATE_TIME_FORMAT.invoiceTable)}
            </Text>
          </div>
          <div className="flex items-center rounded-r-lg border-gray-200 border justify-between whitespace-nowrap py-1 px-2">
            <Text className="whitespace-nowrap text-sm font-medium" isBlock>
              {utilService.formatCurrencyAmount(datum?.amount || 0, organisation.currency)}
            </Text>
            <Text className="whitespace-nowrap text-xs ml-1" isBlock>
              ({utilService.formatCurrencyRateAmount(datum?.currencyRate || 0, organisation.currency)})
            </Text>
          </div>
        </div>
      </div>
    </foreignObject>
  );
};
