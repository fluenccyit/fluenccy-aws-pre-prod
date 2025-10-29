import React from 'react';
import { find, slice } from 'lodash';
import { chartTypeVar, CHART_ROUTES } from '@client/chart';
import { TransactionDetailsByMonthType } from '@shared/transaction';
import { Button, Card, CardContent, FluenccyLoader, Text, TextSkeleton, useQueryLocalCommon } from '@client/common';
import { DashboardChart } from '@client/dashboard';
import xeroNoDataImage from '@assets/images/xero-no-data.png';
import { useHistory } from 'react-router-dom';

type Props = {
  transactionsByMonth: TransactionDetailsByMonthType[];
};

export const DashboardChartContainer = ({ transactionsByMonth }: Props) => {
  const { ui } = useQueryLocalCommon();
  const history = useHistory();

  const goToFullReport = () => {
    chartTypeVar('fx_purchases');
    history.push(CHART_ROUTES.root);
  };

  const renderControls = () => {
    if (ui === 'loading') {
      return (
        <>
          <div className="flex items-start justify-between">
            <TextSkeleton className="w-1/4 h-4" isLoading />
            <TextSkeleton className="hidden w-1/4 h-7 lg:block" isLoading />
          </div>
          <div className="flex flex-wrap items-center mt-2">
            <TextSkeleton className="w-1/6 h-4 mr-2" isLoading />
            <TextSkeleton className="w-1/6 h-4 mr-2" isLoading />
            <TextSkeleton className="w-1/6 h-4 mr-2" isLoading />
          </div>
        </>
      );
    }

    return (
      <>
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <Text className="font-bold mr-2">FX Purchases</Text>
            <Text className="text-xs">Last 6 months</Text>
          </div>
          <Button className="hidden text-sm lg:inline-flex" variant="success" onClick={goToFullReport} isDisabled={ui === 'saving'} isLink isRounded>
            Get the full report
          </Button>
        </div>
        <div className="flex flex-wrap items-center">
          <div className="flex items-center whitespace-nowrap mr-2">
            <div className="inline-block bg-red-500 rounded-sm w-3 h-3 mr-1" />
            <Text className="text-xs">Average Market Rate</Text>
          </div>
          <div className="flex items-center whitespace-nowrap mr-2">
            <div className="inline-block bg-blue-500 rounded-sm w-3 h-3 mr-1" />
            <Text className="text-xs">Delivery Rate</Text>
          </div>
          <div className="flex items-center whitespace-nowrap mr-2">
            <div className="inline-block bg-green-500 rounded-sm w-3 h-3 mr-1" />
            <Text className="text-xs">Fluenccy Perform</Text>
          </div>
        </div>
      </>
    );
  };

  const renderChart = () => {
    if (ui === 'saving' || ui === 'loading') {
      return (
        <div className="flex flex-col items-center justify-center" style={{ height: 350 }}>
          <FluenccyLoader variant="gray" className="w-24" />
        </div>
      );
    }

    const transactionsToUse = slice(transactionsByMonth, 6);

    if (!find(transactionsToUse, ({ averageDeliveryCost }) => averageDeliveryCost)) {
      return (
        <div className="flex flex-col items-center justify-center" style={{ height: 350 }}>
          <div className="w-24 h-36 mb-3.5">
            <img className="w-24 h-36" src={xeroNoDataImage} alt="Hand holding single bar from graph" />
          </div>
          <Text className="font-bold mb-3.5">No Data</Text>
          <Text className="text-sm max-w-md text-center">There is no transaction data to display.</Text>
        </div>
      );
    } else {
      return <DashboardChart transactionsByMonth={transactionsToUse} />;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        {renderControls()}
        {renderChart()}
        {ui === 'loading' ? (
          <TextSkeleton className="block w-full h-7 mt-8 lg:hidden" isLoading />
        ) : (
          <Button
            className="inline-flex text-sm w-full mt-8 lg:hidden"
            variant="success"
            onClick={goToFullReport}
            isDisabled={ui === 'saving'}
            isLink
            isRounded
          >
            Get the full report
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
