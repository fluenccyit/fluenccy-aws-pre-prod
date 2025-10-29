import { PlanTableSkeleton } from '@client/plan';
import { ActionTooltipContent, PlanTable } from '@client/plan/IMS/components';
import { format } from '@client/utils/number';
import React from 'react';
import moment from "moment";
import { Badge, FlagIcon, FluenccyLoader } from '@client/common';

const cuurencyFlagStyle = { width: '22px', height: '22px', style: { marginRight: "5px" } };
const totalStyle = { fontSize: '15px', fontWeight: 'bold' };

export const ManagedEntries = ({loading, list = [], organisation, onAction, dashboardMode, hideTitle, showTotal, submittingId}) => {
  const renderManagedColumn = (r, column) => {
    const isDisabled = r.remainingAmount <= 0;
    switch (column) {
      case 'month':
        return <span className={'flex justify-start'} style={r.id === 'total' ? totalStyle : {}}>{r.id === 'total' ? 'Totals' : `${r[column]}${r['month'] ? `/${r['year']}` : ''}`}</span>;
      case 'currencyCode':
        return <span className='flex items-center justify-start'><FlagIcon currency={r.currencyCode} style={cuurencyFlagStyle} />{r[column]}</span>;
      case 'forecaseAmount':
        return <span className="flex justify-end" style={{ color: "#1C1336", fontWeight: 500 }}>
          <span style={r.id === 'total' ? totalStyle : {}}>{format(Number(r[column]), 2, 3)}</span>
        </span>;
      case 'maxGainLoss':
      case 'minGainLoss':
        const val = Math.round(Number(r[column]));
        return <div className={'flex justify-end'} ><Badge variant={val > 0 ? 'success' : (val == 0.00) ? 'gray' : 'danger'}>{val === 0 ? '0.00' : format(val, 2, 3)}</Badge></div>;
      case 'amountToMax':
      case 'amountToMin':
        return <span className={'flex justify-end'} style={r.id === 'total' ? totalStyle : {color: r[column] > 0 ? 'green' : '#fc2f2f'}}>{r[column] ? format(r[column], 2, 3) : '-'}</span>;
      case 'reserved':
        const reserve = dashboardMode ? Number(r.totalReservedAmount) : Number(r.reservedAmount);
        if (r.id === 'total') {
          return <span className={'flex justify-end'} style={totalStyle}>{format(reserve, 2, 3)}</span>;
        }
        return <span className={'flex justify-end'} >{format(reserve, 2, 3)}</span>;
      case 'status':
        if (isDisabled) {
          return <span className="text-green-500 font-medium flex justify-center">Approved</span>;
        }
        if (!r.isManaged) {
          return <span className="text-red-500 font-medium flex justify-center">Unmanaged</span>;
        }
        return <span className="text-red-500 font-medium flex justify-center">Pending approval</span>;
      case 'daysToPay':
        const dtp = moment(r.dateDue).diff(moment(), 'days');
        return dtp > 0 ? dtp : 0;
      case 'actions':
        const options = [];

        if (isDisabled) {
          options.push({ label: 'View Dashboard', value: 'dashboard' });
        } else if (dashboardMode) {
          if (r.isManaged) {
            options.push({ label: 'Approve', value: 'approve' });
          } else {
            options.push({ label: 'Manage', value: 'manage' });
          }
        } else {
          options.push({ label: 'Approve', value: 'approve' });
          options.push({ label: 'Remove', value: 'remove' });
        }

        if (r.id === submittingId) {
          return <div className="flex items-center justify-center"><FluenccyLoader style={{width: '28px', height: '16px'}}/></div>;
        }

        return <ActionTooltipContent options={options} onSelect={onAction.bind(this, r)} currency={organisation?.currency} isDisabled={isDisabled} />;
      case 'reserveMax':
      case 'reserveMin':
        return <span className={'flex justify-end'} style={r.id === 'total' ? totalStyle : {}}>{format(Number(r[column]), 2, 3)}</span>;
      case 'reserveRate':
        return <span className={'flex justify-end'}>{r[column] ? r[column]?.toFixed(5) : '-'}</span>;
      case 'budgetRate':
      case 'currentRate':
        return <span className={'flex justify-end'} style={r.id === 'total' ? totalStyle : {}}>{(r.id !== 'total' && Number(r[column])?.toFixed(5))}</span>;
      default:
        return r.id !== 'total' && <span className={'flex justify-start'}>{r[column]}</span>;
    }
  };

  let managedInvoiceColumns = [
    { key: 'month', label: 'Month', onRender: renderManagedColumn, align: 'start' },
    { key: 'currencyCode', label: 'CCY', onRender: renderManagedColumn, align: 'start' },
    { key: 'forecaseAmount', label: 'Forecast Amount', onRender: renderManagedColumn, align: 'end' },
    { key: 'reserved', label: 'Reserved', onRender: renderManagedColumn, align: 'end' },
    { key: 'reserveRate', label: 'Reserve Rate', onRender: renderManagedColumn, align: 'end' },
    { key: 'reserveMax', label: 'Reserve Max', onRender: renderManagedColumn, align: 'end' },
    { key: 'reserveMin', label: 'Reserve Min', onRender: renderManagedColumn, align: 'end' },
    { key: 'budgetRate', label: 'Budget Rate', onRender: renderManagedColumn, align: 'end' },
    { key: 'currentRate', label: 'Current Rate', onRender: renderManagedColumn, align: 'end' },
    { key: 'amountToMax', label: 'Amount to Max', onRender: renderManagedColumn, align: 'end' },
    { key: 'maxGainLoss', label: 'Gain/loss', onRender: renderManagedColumn, align: 'end' },
    { key: 'amountToMin', label: 'Amount to Min', onRender: renderManagedColumn, align: 'end' },
    { key: 'minGainLoss', label: 'Gain/loss', onRender: renderManagedColumn, align: 'end' },
  ];

  if (!dashboardMode) {
    managedInvoiceColumns = [
      ...managedInvoiceColumns,
      { key: 'status', label: 'Status', onRender: renderManagedColumn, align: 'center' },
      { key: 'actions', label: 'Actions', onRender: renderManagedColumn, align: 'center' }
    ]
  } else {
    managedInvoiceColumns = [
      ...managedInvoiceColumns,
      { key: 'actions', label: 'Actions', onRender: renderManagedColumn, align: 'center' }
    ]
  }

  return (
    <div className="w-full flex flex-col px-4 py-6">
      <div className="flex h-full w-full bg-white px-2 rounded-lg">
        <div className="w-full">
          {loading ? <PlanTableSkeleton rows={5} columns={15} /> :
          <PlanTable
            draggable={false}
            rows={list}
            columns={managedInvoiceColumns}
            title={!hideTitle && "MANAGED SECTION"}
            showEmpty
            emptyTitle="No records"
            loading={loading}
          />}
        </div>
      </div>
    </div>
  )
};