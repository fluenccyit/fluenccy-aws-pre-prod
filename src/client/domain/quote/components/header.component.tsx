import React, { memo } from 'react';
import cn from 'classnames';
import { Button, Icon, Select, TextSkeleton, Toggle } from '@client/common';
import { PayableReceivable, PayableCurrency, PayableProbability, PayableMonth } from '@client/plan';
import { useQueryLocalUser } from '@client/user';
import { Actions } from './actions.component';
import { FILTER_OPTIONS } from '../utils';

const BASE_CLASSES = ['absolute', 'flex', 'bg-white', 'w-full', 'h-32', 'px-12', 'flex-col'];

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
  showImpactAndSavings?: boolean;
  onToggleImpactAndSavings?: () => void;
};

export const QuoteHeader = memo(
  ({
    currencies,
    onChangeCurrency,
    loading,
    receivable,
    onChangeReceivable,
    orderProbability,
    minimumProbability,
    maximumProbability,
    isSetOptimised,
    homeCurrencies,
    onChangeHomeCurrency,
    homeCurrency,
    currency,
    onClickAction,
    showManaged,
    onChangeManaged,
    onAddNew,
    onDeleteNew,
    editMode,
    onChangeMonth,
    month,
    filterBy,
    onFilter,
    addNew,
    showImpactAndSavings = false,
    onToggleImpactAndSavings,
    hasRows = false, // Add this prop to check if there are rows
  }: Props) => {
    const { user: localUser } = useQueryLocalUser();

    return (
      <div className={cn(BASE_CLASSES)}>
        <div className="flex border-b border-gray-300 shadow-md h-16">
          <PayableReceivable selected={receivable} onChange={onChangeReceivable} />
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
          <PayableMonth onChange={onChangeMonth} month={month} />
          {localUser?.role === 'superdealer' && isSetOptimised && (
            <PayableProbability
              orderProbability={orderProbability}
              minimumProbability={minimumProbability}
              maximumProbability={maximumProbability}
              isSetOptimised={isSetOptimised}
            />
          )}
        </div>
        <div className="flex justify-end">
          <Actions onAction={onClickAction} disableQuotes={!editMode && !addNew} />

          {/* Add Impact & Savings Toggle before Edit button */}
          <div className="flex items-center mr-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showImpactAndSavings}
                onChange={onToggleImpactAndSavings}
                className="sr-only"
              />
              <div
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  showImpactAndSavings ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showImpactAndSavings ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">Show Impact & Savings</span>
            </label>
          </div>

          <div className={`flex items-center mr-2`}>
            <span className={`text-sm mr-1`}>Filter </span>
            <Select
              options={FILTER_OPTIONS}
              value={filterBy}
              onChange={onFilter}
              isDisabled={false}
              className="mr-2 w-auto"
              style={{ width: 'auto', lineHeight: '0.875rem' }}
            />
          </div>

          {/* Only show + button in header if there are no rows */}
          {!hasRows && (
            <div className="flex py-2 items-center">
              <Button
                onClick={onAddNew}
                className="p-2"
                style={{ padding: '4px 8px', margin: '0 20px', height: '35px' }}
              >
                <Icon icon="add-circle-filled" height={25} width={25} />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
);
