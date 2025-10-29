import React, { memo } from 'react';
import { GqlSupportedCurrency } from '@graphql';
import { UploadCSVDetailsBreakdownTooltip } from '@client/upload-csv';
import { TransactionBreakdownType } from '@shared/transaction';
import { Text, utilService, TextSkeleton } from '@client/common';

type Props = {
  breakdown: TransactionBreakdownType;
  baseCurrency: GqlSupportedCurrency;
  tradeCurrency: GqlSupportedCurrency;
  isEmpty?: boolean;
};

export const UploadCSVDetailsBreakdownVolatility = memo(({ breakdown }: Props) => {
  const { maxCost, maxRate, averageDeliveryCost, averageDeliveryRate, minCost, minRate } = breakdown;

  return (
    <div className="flex">
      <div className="bg-gray-200 rounded-full w-3 mr-2" />
      <div className="w-full" style={{ marginLeft: '-19px' }}>
        <UploadCSVDetailsBreakdownTooltip variant="danger">
          <Text className="text-sm font-bold" variant="gray">
            High <Text variant="danger">asdfasdf</Text>
          </Text>
        </UploadCSVDetailsBreakdownTooltip>

        <Text className="text-sm ml-6 mt-1" isBlock>
          <Text className="font-bold">Base Currency</Text> bought
          <Text className="font-bold mx-1">Currency rate</Text>
        </Text>

        <UploadCSVDetailsBreakdownTooltip className="mt-4" variant="neutral">
          <Text className="text-sm font-bold" variant="gray">
            Average <Text variant="dark">AVG CRRRR</Text>
          </Text>
        </UploadCSVDetailsBreakdownTooltip>
        <>
          <Text className="text-sm ml-6 mt-1" isBlock>
            <Text className="font-bold">ADF ASF ASDF</Text> bought
            <Text className="font-bold mx-1">GGGGGG</Text>
          </Text>
          <Text className="text-xs ml-6" variant="gray" isBlock>
            Without a plan in place you have increased exposure to volatility
          </Text>
        </>

        <UploadCSVDetailsBreakdownTooltip className="mt-4" variant="success">
          <Text className="text-sm font-bold" variant="gray">
            Low <Text variant="success">DDDDDD</Text>
          </Text>
        </UploadCSVDetailsBreakdownTooltip>

        <Text className="text-sm ml-6 mt-1" isBlock>
          <Text className="font-bold">AADSF ASDF ASDF ASDF</Text> bought
          <Text className="font-bold mx-1">HHHH</Text>
        </Text>
      </div>
    </div>
  );
});
