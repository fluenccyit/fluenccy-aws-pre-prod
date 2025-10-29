import React from 'react';
import cn from 'classnames';
import { useQueryLocalCommon } from '@client/common';
import { GqlCurrencyScoreBreakdown } from '@graphql';
import { TransactionBreakdownType } from '@shared/transaction';
import {
  DashboardChartContainer,
  DashboardCoachingCard,
  DashboardCoachingCardSkeleton,
  DashboardCurrencyScoreBreakdown,
  DashboardCurrencyScoreBreakdownSkeleton,
  DashboardForeignCurrencyCard,
  DashboardForeignCurrencyCardSkeleton,
} from '@client/dashboard';

type Props = {
  transactionBreakdown: TransactionBreakdownType | null;
  currencyScoreBreakdown: GqlCurrencyScoreBreakdown | null;
};

const BASE_CLASSES = ['flex', 'flex-col', 'mx-auto', 'pb-2', 'items-center'];
const RESPONSIVE_CLASSES = ['md:pb-6', 'lg:px-12', 'lg:py-0', 'md:flex-row', 'md:items-start', 'md:max-w-screen-xl'];

export const DashboardContent = ({ transactionBreakdown, currencyScoreBreakdown }: Props) => {
  const { ui } = useQueryLocalCommon();

  return (
    <div className={cn(BASE_CLASSES, RESPONSIVE_CLASSES)}>
      {ui === 'loading' && <DashboardCurrencyScoreBreakdownSkeleton />}
      {ui !== 'loading' && !currencyScoreBreakdown && <DashboardCurrencyScoreBreakdownSkeleton isLoading={false} />}
      {ui !== 'loading' && currencyScoreBreakdown && <DashboardCurrencyScoreBreakdown breakdown={currencyScoreBreakdown} />}
      <div className="flex flex-col overflow-x-hidden w-full">
        <div className="mt-6 md:mt-0 ml-0 md:ml-6">
          <DashboardChartContainer transactionsByMonth={transactionBreakdown?.transactionsByMonth || []} />
        </div>
        <div className="flex flex-col xl:flex-row mt-6 ml-0 md:ml-6">
          {ui === 'loading' && (
            <>
              <DashboardForeignCurrencyCardSkeleton />
              <DashboardCoachingCardSkeleton />
            </>
          )}
          {ui !== 'loading' && currencyScoreBreakdown && transactionBreakdown && (
            <>
              <DashboardForeignCurrencyCard currencyScoreBreakdown={currencyScoreBreakdown} transactionBreakdown={transactionBreakdown} />
              <DashboardCoachingCard />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
