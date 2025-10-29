import React, { memo, ReactNode } from 'react';
import cn from 'classnames';
import { Button, Page, PageContent, Text, TextSkeleton } from '@client/common';
import { PayableReceivable } from './payable-page.component';
import { PayableCurrency } from './payable-page-currency-component';
import { PayableMonth } from './payable-page-month-component';
import { PayableView } from './payable-content-view.component';
import { PayableImport } from './payable-page-import-component';
import { PayableProbability } from './payable-probability-component';
import { useQueryLocalUser } from '@client/user';

const BASE_CLASSES = ['absolute', 'flex', 'bg-white', 'border-b', 'border-gray-300', 'shadow-md', 'w-full', 'h-16', 'px-12'];

type Props = {
  className?: string;
  onChangePayableTab: Function;
  onChangeCurrency: Function;
  tab: string;
  onChangeMonth: Function;
  month: string;
  loading: Boolean;
  currencies: [String];
  receivable: string;
  onChangeReceivable: Function;
  showPayableTab: Boolean;
  orderProbability: number;
  minimumProbability: number;
  maximumProbability: number;
  isSetOptimised: boolean;
};

export const PayableContent = memo(
  ({
    currencies,
    onChangePayableTab,
    onChangeCurrency,
    tab,
    onChangeMonth,
    month,
    loading,
    receivable,
    onChangeReceivable,
    showPayableTab = true,
    orderProbability,
    minimumProbability,
    maximumProbability,
    isSetOptimised,
    homeCurrencies,
    onChangeHomeCurrency,
    homeCurrency,
    currency,
    showImport,
  }: Props) => {
    const { user: localUser } = useQueryLocalUser();

    return (
      <div className={cn(BASE_CLASSES)}>
        {loading ? <TextSkeleton className="my-0.5 h-10 w-60" /> : <PayableReceivable selected={receivable} onChange={onChangeReceivable} />}
        {!showImport && (
          <>
            {loading ? (
              <>
                <TextSkeleton className="my-0.5 h-10 w-32" />
                <TextSkeleton className="my-0.5 h-10 w-32" />
              </>
            ) : (
              <PayableCurrency
                tab={receivable}
                currencies={currencies}
                onChangeCurrency={onChangeCurrency}
                onChangeHomeCurrency={onChangeHomeCurrency}
                homeCurrencies={homeCurrencies}
                currency={currency}
                homeCurrency={homeCurrency}
                isSuperdealer={localUser?.role === 'superdealer' && isSetOptimised}
              />
            )}
            {loading ? <TextSkeleton className="my-0.5 h-10 w-96" /> : <PayableMonth onChange={onChangeMonth} month={month} />}
            {localUser?.role === 'superdealer' &&
              isSetOptimised &&
              (loading ? (
                <TextSkeleton className="my-0.5 h-10 w-96" />
              ) : (
                <PayableProbability
                  orderProbability={orderProbability}
                  minimumProbability={minimumProbability}
                  maximumProbability={maximumProbability}
                  isSetOptimised={isSetOptimised}
                />
              ))}
            {showPayableTab &&
              (loading ? <TextSkeleton className="my-0.5 h-10 w-60" /> : <PayableView onChangeTab={onChangePayableTab} selected={tab} />)}
            {/* <PayableImport /> */}
          </>
        )}
      </div>
    );
  }
);
