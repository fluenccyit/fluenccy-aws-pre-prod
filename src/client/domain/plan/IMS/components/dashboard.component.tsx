import React, { useMemo, useState, useEffect } from 'react';
import { Badge, Button, FlagIcon, useModal, Select } from '@client/common';
import { last, uniqBy, upperFirst } from 'lodash';
import cn from 'classnames';
import { DashboardChartContainer, DashboardCurrencyScoreBreakdown } from './index';
import { TransactionBreakdownType } from '@shared/transaction';
import { GqlCurrencyScoreBreakdown } from '@graphql';
import moment from 'moment';

import { PlanTable, ScheduleModal } from '@client/plan/IMS/components';
import { format } from '@client/utils/number';
import styled from 'styled-components';
import { ActionTooltipContent } from '@client/plan/IMS/components';
import { PlanPage } from '@client/plan';
import { useHistory } from 'react-router-dom';

const modeOptions = [
  { label: 'Payables', value: '' },
  { label: 'Receivables', value: 'receivables' },
];

type Props = {
  transactionBreakdown: TransactionBreakdownType | null;
  onBack: Function;
  organisation: object;
  managedInvoices: object[];
  currencyImpactInvoices: object[];
  unmanagedInvoices: object[];
  showCurrencyScoreBreakdown?: boolean;
};

const BASE_CLASSES = ['flex', 'w-full', 'mx-auto', 'pb-2', 'items-center', 'justify-between'];
const RESPONSIVE_CLASSES = ['md:pb-6', 'lg:px-12', 'lg:py-0', 'md:flex-row', 'md:items-start'];
const cuurencyFlagStyle = { width: '22px', height: '22px', style: { marginRight: '5px' } };

export const Dashboard = ({
  setRates,
  getOptimisedInvoices,
  showCurrencyScoreTitle = false,
  handleOptimisedInvoiceSelect,
  hideChart = false,
  chartBarClickable = true,
  title,
  isFullWidth = false,
  showList = true,
  showBack = true,
  fosPercents,
  onBack,
  organisation,
  managedInvoices,
  currencyImpactInvoices = [],
  onApprove,
  optimisedInvoices,
  currencies,
  marginPercentageVal,
  liveData,
  getOptimisedPayableRate,
  mode = '',
  onChangeMode,
  homeCurrencies,
  unmanagedInvoices,
  entitlements,
  showCurrencyScoreBreakdown = true,
  showModeSelection = true,
}: Props) => {
  const [selectedCurrency, setSelectedCurrency] = useState(managedInvoices?.[0]?.currencyCode);
  const [selectedHomeCurrency, setSelectedHomeCurrency] = useState(managedInvoices?.[0]?.homeCurrencyCode);
  const [selectedDate, setSelectedDate] = useState();
  const currencyScoreBreakdown: GqlCurrencyScoreBreakdown = last(organisation?.currencyScores) || null;
  const { openModal, setWidth } = useModal();
  const history = useHistory();

  useEffect(() => {
    if (!selectedCurrency) {
      setSelectedCurrency(managedInvoices?.[0]?.currencyCode || unmanagedInvoices?.[0]?.currencyCode);
    }

    if (!selectedHomeCurrency) {
      setSelectedHomeCurrency(managedInvoices?.[0]?.homeCurrencyCode || unmanagedInvoices?.[0]?.homeCurrencyCode);
    }
  }, [managedInvoices, selectedCurrency, selectedHomeCurrency]);

  const toggleView = () => {
    history.push({ pathname: '/plan', state: { from: 'import', mode } });
  };

  const showSchedule = (r, v) => {
    if (v === 'manage') {
      onBack();
    } else {
      setWidth('40%');
      openModal(
        <ScheduleModal
          currencies={currencies}
          setRates={setRates}
          getOptimisedPayableRate={getOptimisedPayableRate}
          title="Monitoring"
          fosPercents={fosPercents}
          marginPerc={marginPercentageVal}
          liveRates={liveData}
          optimisedRate={getOptimisedPayableRate(r)}
          onApprove={onApprove}
          invoice={r}
          organisation={organisation}
          entitlements={entitlements}
        />
      );
    }
  };
  const handleBarClick = (date) => {
    if (selectedDate !== date) {
      setSelectedDate(date);
    } else {
      setSelectedDate('');
    }
  };

  const removeDate = (date) => {
    setSelectedDate(selectedDate.filter((d) => d !== date));
  };

  const clearFilter = () => {
    setSelectedDate([]);
    setSelectedCurrency('');
  };

  const filterByCurrency = (d) => {
    if (mode === 'receivables') {
      setSelectedCurrency(d.value);
    } else {
      setSelectedCurrency(d.value === organisation.currency ? '' : d.value);
    }
  };

  const filterByHomeCurrency = (d) => {
    const currencyExist = currencies.find((c: { currencyPair: string }) => c.currencyPair === `${d.value}${selectedCurrency}`);
    if (!currencyExist) {
      // set to first currency
      const firstCurrency = currencies.find((c) => c.currencyPair === `${d.value}${c.currencyCode}`);
      setSelectedCurrency(firstCurrency.currencyCode);
    }
    setSelectedHomeCurrency(d.value);
  };
  const filterInvoices = useMemo(() => {
    let data = [...managedInvoices, ...currencyImpactInvoices];
    if (mode === 'receivables') {
      if (selectedHomeCurrency) {
        data = data.filter((r) => r.homeCurrencyCode === selectedHomeCurrency);
      }
      if (selectedCurrency) {
        data = data.filter((r) => r.currencyCode === selectedCurrency);
      }
    } else {
      if (selectedCurrency && selectedCurrency !== organisation.currency) {
        data = data.filter((r) => r.currencyCode === selectedCurrency);
      }
    }

    return data.filter((r) => !r.isPricing);
  }, [currencyImpactInvoices, managedInvoices, mode, selectedCurrency, selectedDate, selectedHomeCurrency]);

  const renderColumn = (r, column) => {
    const baseCurrency = mode === 'receivables' ? r.homeCurrencyCode : organisation?.currency;
    switch (column) {
      case 'date':
      case 'dateDue':
        return moment(r[column]).format('DD MMM YYYY');
      case 'total':
        return (
          <span className="flex items-center font-bold text-black">
            <FlagIcon currency={r.currencyCode} style={cuurencyFlagStyle} /> {format(Number(r.total), 2, 3)}
          </span>
        );
      case 'targetCost':
        const item = optimisedInvoices.find((o) => o.invoiceId === r.invoiceId);
        if (r.isApproved === 'true') {
          return (
            <span className="text-black" style={{ color: '#706A7A' }}>
              N/A
            </span>
          );
        }

        return (
          <span className="flex items-center font-bold text-black" style={{ color: '#706A7A' }}>
            <FlagIcon currency={baseCurrency} style={cuurencyFlagStyle} />{' '}
            {format(Number(r.buyingSchedule?.optimaisedValue) || Number(item.targetCost || getOptimisedInvoices([r])[0].targetCost), 2, 3)}
          </span>
        );
      case 'currentCost':
        if (r.isApproved === 'true') {
          return (
            <span className="text-black" style={{ color: '#706A7A' }}>
              N/A
            </span>
          );
        }
        return (
          <span className="flex items-center font-bold text-black" style={{ color: '#706A7A' }}>
            <FlagIcon currency={baseCurrency} style={cuurencyFlagStyle} /> {format(Number(r[column]), 2, 3)}
          </span>
        );
      case 'lossOrGain':
        if (r.isApproved === 'true') {
          return <span className="text-black">N/A</span>;
        }
        return (
          <Badge variant={Number(r.lossOrGain) > 0 ? 'success' : 'danger'}>
            {Number(r.lossOrGain) > 0 ? '+' : ''}
            {format(Number(r.lossOrGain), 2, 3)}
          </Badge>
        );
      case 'type':
        if (!!r.manage_type) {
          const manageType = r.manage_type === 'Plan' ? 'Planned' : 'Forward';
          if (r.isApproved === 'true') {
            return <span className="text-green-500 font-medium">Approved ({manageType})</span>;
          }
          return <span className="text-red-500 font-medium">Awaiting approval ({manageType})</span>;
        }
        return <span style={{ color: '#FF6978' }}>{upperFirst(r[column])}</span>;
      case 'actions':
        const options = [];
        if (r.type === 'unmanaged') {
          const optR = optimisedInvoices.find((record) => record.invoiceId === r.invoiceId);
          const data = {
            ...r,
            targetCost: optR?.targetCost || 0,
            saving: optR?.saving || 0,
            optimisedRate: optimisedInvoices.find((record) => record.invoiceId === r.invoiceId).optimisedRate,
          };
          return <ActionTooltipContent data={data} onSelect={(v) => handleOptimisedInvoiceSelect(r, v)} currency={baseCurrency} width="415px" />;
        } else if (r.isPricing) {
          options.push({ label: 'Managed in CMS', value: 'managedInCMS' });
        } else if (r.isApproved === 'true') {
          options.push({ label: 'Monitor', value: 'monitor' });
        } else {
          options.push({ label: 'Review', value: 'review' });
        }
        return <ActionTooltipContent options={options} onSelect={showSchedule.bind(null, r)} currency={baseCurrency} />;
      default:
        return r[column];
    }
  };
  const invoiceColumns = [
    { key: 'date', label: 'Invoice Date', onRender: renderColumn },
    { key: 'invoiceNumber', label: '#', onRender: renderColumn },
    { key: 'contactName', label: 'Company', onRender: renderColumn },
    { key: 'dateDue', label: 'Due Date', onRender: renderColumn },
    { key: 'total', label: 'Amount', onRender: renderColumn },
    { key: 'currentCost', label: 'Current Cost', onRender: renderColumn, tooltip: 'Cost In Home Currency as per Forward Rate' },
    { key: 'lossOrGain', label: 'Gain / Loss', onRender: renderColumn, tooltip: 'Gain/Loss as per market rate' },
    { key: 'targetCost', label: 'Target Cost', onRender: renderColumn, tooltip: 'Cost That Can be Targeted with Fluenccy Savings Plan' },
    { key: 'type', label: 'Status', onRender: renderColumn },
    { key: 'actions', label: 'Actions', onRender: renderColumn, align: 'center' },
  ];

  const tableLists = useMemo(() => {
    if (selectedDate) {
      return filterInvoices.filter((r) => selectedDate === moment(r.dateDue).format('MMM YYYY'));
    }

    return filterInvoices;
  }, [filterInvoices]);

  return (
    <div className="flex w-full relative justify-center align-center flex-col">
      {showBack && (
        <div className="pt-1 w-full flex justify-end px-16  pb-4 z-50" style={{ zIndex: 99 }}>
          <Button onClick={onBack}>Plan</Button>
        </div>
      )}
      <div className={cn(BASE_CLASSES, RESPONSIVE_CLASSES)} style={{ width: isFullWidth ? '100%' : '90%' }}>
        {showCurrencyScoreBreakdown && (
          <DashboardCurrencyScoreBreakdown breakdown={currencyScoreBreakdown} isFullWidth={isFullWidth} showTitle={showCurrencyScoreTitle} />
        )}
        <div className="flex flex-col w-full" style={{ width: !showCurrencyScoreBreakdown ? '100%' : isFullWidth ? '73%' : '68%' }}>
          {title && <div className="font-medium text-lg mb-2">{title}</div>}
          {showModeSelection && (
            <Select
              defaultValue={mode}
              options={modeOptions}
              isDisabled={false}
              onChange={onChangeMode}
              value={mode}
              // menuPlacement="auto"
              style={{ width: '200px' }}
            />
          )}
          <div className={`mt-6 md:mt-0 ml-0 w-full ${hideChart ? 'flex justify-center' : ''}`}>
            {hideChart ? (
              <PlanPage btnText="Import" onClick={toggleView} />
            ) : (
              <DashboardChartContainer
                data={filterInvoices}
                handleBarClick={handleBarClick}
                currency={selectedCurrency}
                dates={selectedDate}
                onRemoveDate={removeDate}
                onRemoveCurrency={() => setSelectedCurrency(organisation.currency)}
                clearFilter={clearFilter}
                organisation={organisation}
                optimisedInvoices={optimisedInvoices}
                filterByCurrency={filterByCurrency}
                currencies={currencies}
                managedInvoices={managedInvoices}
                isFullWidth={isFullWidth}
                chartBarClickable={chartBarClickable}
                getOptimisedInvoices={getOptimisedInvoices}
                mode={mode}
                homeCurrencies={homeCurrencies}
                filterByHomeCurrency={filterByHomeCurrency}
                homeCurrency={selectedHomeCurrency}
              />
            )}
          </div>
        </div>
      </div>
      {showList && (
        <div className="mx-20 my-10">
          <StyledTableHeader className="w-full py-1 flex mb-3">Upcoming Invoices</StyledTableHeader>
          <PlanTable rows={tableLists} columns={invoiceColumns} draggable={false} bodyRowClass="bg-red-200" />
        </div>
      )}
    </div>
  );
};

const StyledTableHeader = styled.div`
  color: #222222;
  font-weight: 500;
  font-size: 20px;
`;
