import { Badge, FlagIcon, FluenccyLoader } from '@client/common';
import { PlanTableSkeleton } from '@client/plan';
import { ActionTooltipContent, PlanTable } from '@client/plan/IMS/components';
import { format } from '@client/utils/number';
import { isEmpty, max } from 'lodash';
import React, { useMemo, useState, useRef } from 'react';

const totalStyle = { fontSize: '15px', fontWeight: 'bold' };
const cuurencyFlagStyle = { width: '22px', height: '22px', style: { marginRight: "5px" } };

export const UnmanagedEntries = ({loading, list = [], organisation, onAction, onChangeReserve, submittingId}) => {
  const [detailsheight, setDetailsHeight] = useState(40.5);
  const [impactHeight, setImpactHeight] = useState(40.5);
  const [optimiseHeight, setOptimiseHeight] = useState(40.5);
  const [editableId, setEditableId] = useState();
  const [modifiedValue, setModifiedValue] = useState();
  const firstInputRef = useRef();

  const maxHeight = useMemo(() => {
    return max([optimiseHeight, detailsheight, impactHeight]);
  }, [optimiseHeight, detailsheight, impactHeight]);

  const onBlur = (r, e) => {
    onChangeReserve( editableId, r, e.target.value);
    setEditableId('');
    setModifiedValue('');
  }

  const onKeyPress = (e) => {
    if (e.key === 'Enter') {
      onBlur(e);
    }
  }

  const onEdit = (id) => {
    setEditableId(id);
    setTimeout(() => firstInputRef.current.focus(), 100);
  }

  const onChangeInput = (r, e) => {
    const {value} = e.target;
    if (Number(value) <= r.remainingAmount) {
      setModifiedValue(value);
    }
  }

  const renderUnmanagedColumn = (r, column) => {
    switch (column) {
      case 'month':
        return <span style={r.id === 'total' ? totalStyle : {}}>{r.id === 'total' ? 'Totals' : `${r[column]}${r['month'] ? `/${r['year']}` : ''}`}</span>;
      case 'currencyCode':
        return <span className='flex items-center justify-start'><FlagIcon currency={r.currencyCode} style={cuurencyFlagStyle} />{r[column]}</span>;
      case 'forecaseAmount':
        return <span className="flex items-center justify-end" style={{ color: "#1C1336", fontWeight: 500 }}>
          <span style={r.id === 'total' ? totalStyle : {}}>{format(Number(r[column]), 2, 3)}</span>
        </span>;
      case 'reserveMax':
      case 'reserveMin':
        return <span className="flex items-center justify-end" style={{ color: "#1C1336", fontWeight: 500 }}>
          <span style={r.id === 'total' ? totalStyle : {}}>{format(Number(r[column]), 2, 3)}</span>
        </span>;
      case 'status':
        const manageType = r.manage_type === "Plan" ? "Planned" : "Forward";
        if (r.isApproved) {
          return <span className="text-green-500 font-medium">Approved ({manageType})</span>;
        }
        return <span className="text-red-500 font-medium">Awaiting approval ({manageType})</span>;
      case 'budgetRate':
        return <span className={r[column] ? 'flex justify-end' : 'flex justify-center'} style={r.id === 'total' ? totalStyle : {}}>{r[column]}</span>
      default:
        return r.id !== 'total' && <span className={'flex justify-end'}>{r[column]}</span>;
    }
  };

  const renderImpactColumn = (r, column) => {
    switch (column) {
      case 'reserveMax':
      case 'reserveMin':
        return <span className="flex items-center justify-end" style={{ color: "#1C1336", fontWeight: 500 }}>
          <span style={r.id === 'total' ? totalStyle : {}}>{format(Number(r[column]), 2, 3)}</span>
        </span>;
      case 'maxGainLoss':
      case 'minGainLoss':
        const val = Math.round(Number(r[column]));
        return <div className={'flex justify-end'} ><Badge variant={val > 0 ? 'success' : (val == 0.00) ? 'gray' : 'danger'}>{val === 0 ? '0.00' : format(val, 2, 3)}</Badge></div>;
      case 'currentRate':
        return <span className={r[column] ? 'flex justify-end' : 'flex justify-center'} style={r.id === 'total' ? totalStyle : {}}>{r[column]?.toFixed(5)}</span>;
      default:
        return <span className={r[column] ? 'flex justify-end' : 'flex justify-center'} style={r.id === 'total' ? totalStyle : {}}>{r[column]}</span>;
    }
  };

  const renderOptimisedColumn = (r, column) => {
    const isDisabled = r.remainingAmount <= 0;
    switch(column) {
      case 'actions':
        if (r.id !== 'total') {
          const options = [{ label: 'Buy Now', value: 'Forward' }];

          if (r.id === submittingId) {
            return <div className="flex items-center justify-center"><FluenccyLoader style={{width: '28px', height: '16px'}}/></div>;
          }
          return <ActionTooltipContent options={options} onSelect={onAction.bind(this, r)} currency={organisation?.currency} isDisabled={isDisabled} />
        }
        return null;
      case 'totalReservedAmount':
        return <span className="flex items-center justify-end">{format(Number(r[column]), 2, 3)}</span>;
      case 'reserveEditableMin':
        return (
          <span className="flex items-center justify-end" style={{ color: "#706A7A", fontWeight: 'bold' }} onClick={r.id !== editableId && r.id !== 'total' ? () => onEdit(r.id) : null} >
            {editableId === r.id && !isDisabled ? <input min='0' type="number" onChange={e => onChangeInput(r, e)} onBlur={(e) => onBlur(r, e)} onKeyPress={onKeyPress} value={modifiedValue || r[column]} className="py-1 px-2 border" style={{maxWidth: '93px', textAlign: 'center'}} ref={firstInputRef} /> : <span style={r.reserveMin && r.reserveMin !== r[column] && r.id !== 'total' && !isDisabled ? {color: 'blue'} : {}}>{isDisabled ? 0 : format(Number(r[column]), 2, 3)}</span>}
          </span>
        );
      case 'currentRate':
        return <span className={r[column] ? 'flex justify-end' : 'flex justify-center'} style={r.id === 'total' ? totalStyle : {}}>{r[column]?.toFixed(5)}</span>;
      default:
        return null;
    }
  };


  const currencyImpactColumns = [
    { key: 'currentRate', label: 'Current Rate', onRender: renderImpactColumn, align: 'end' },
    { key: 'reserveMax', label: 'Amount to Max', onRender: renderImpactColumn, align: 'end' },
    { key: 'maxGainLoss', label: 'Gain/loss', onRender: renderImpactColumn, align: 'end' },
    { key: 'reserveMin', label: 'Amount to Min', onRender: renderImpactColumn, align: 'end' },
    { key: 'minGainLoss', label: 'Gain/loss', onRender: renderImpactColumn, align: 'end' }
  ]

  const detailsColumns = [
    { key: 'month', label: 'Month', onRender: renderUnmanagedColumn },
    { key: 'currencyCode', label: 'Currency', onRender: renderUnmanagedColumn, align: 'start' },
    { key: 'forecaseAmount', label: 'Forecast Amount', onRender: renderUnmanagedColumn, align: 'end' },
    { key: 'reserveMax', label: 'Reserve Max', onRender: renderUnmanagedColumn, align: 'end'},
    { key: 'reserveMin', label: 'Reserve Min', onRender: renderUnmanagedColumn, align: 'end' },
    { key: 'budgetRate', label: 'Budget Rate', onRender: renderUnmanagedColumn, align: 'end' }
  ];

  const planColumns = [
    { key: 'totalReservedAmount', label: 'Reserved', onRender: renderOptimisedColumn, style: {}, align: 'end' },
    { key: 'reserveEditableMin', label: 'Order', onRender: renderOptimisedColumn, isEditable: true, align: 'end' },
    { key: 'currentRate', label: 'Current Rate', onRender: renderOptimisedColumn, style: {}, align: 'end' },
    { key: 'actions', label: 'Actions', onRender: renderOptimisedColumn, align: 'center' }
  ];

  return (
    <div className="flex mx-4">
      <div className="w-1/3 p-2" style={{ width: '42%' }}>
        {loading ? <PlanTableSkeleton rows={5} columns={6} /> :
          <PlanTable
            draggable={false}
            rows={list}
            columns={detailsColumns}
            title="DETAILS"
            onTableHeaderHeightChange={setDetailsHeight}
            height={maxHeight}
            showEmpty
            emptyTitle="No records"
            loading={loading}
          />
        }
      </div>
      <div className="w-1/3 p-2" style={{ width: '35%' }}>
        {loading ? <PlanTableSkeleton rows={5} columns={5} />:
          <PlanTable
            rows={list}
            columns={currencyImpactColumns}
            draggable={false}
            title="Current Impact"
            onTableHeaderHeightChange={setImpactHeight}
            height={maxHeight}
            showEmpty
            emptyTitle="No records"
            loading={loading}
          />
        }
      </div>
      <div className="w-1/3 p-2" style={{ width: '23%' }}>
        {loading ? <PlanTableSkeleton rows={5} columns={3} /> :
          <PlanTable
            draggable={false}
            rows={list}
            columns={planColumns}
            bodyRowClass="bg-blue-200"
            title="PLAN"
            onTableHeaderHeightChange={setOptimiseHeight}
            height={maxHeight}
            showEmpty
            emptyTitle="No records"
            loading={loading}
          />
        }
      </div>
    </div>
  )
};