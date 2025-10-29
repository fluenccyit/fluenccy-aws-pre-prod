import { Icon } from '@client/common';
import { isEmpty } from 'lodash';
import React, { memo, useLayoutEffect, useRef, useEffect } from 'react';
import ReactTooltip from 'react-tooltip';
import styled from 'styled-components';

export const PlanTable = memo(
  ({
    rows,
    sortBy,
    sortDir,
    columns,
    sortColumns,
    bodyRowClass = '',
    rowHeight,
    title,
    onTableHeaderHeightChange,
    height = 40.5,
    showEmpty = true,
    emptyTitle,
    loading = false,
    useRecordHeight,
    emptyContainerClass = 'h-48',
    forceCalculate = false,
  }: any) => {
    const headerRef = useRef();

    useEffect(() => {
      if (headerRef.current && onTableHeaderHeightChange) {
        setTimeout(() => onTableHeaderHeightChange(headerRef.current?.clientHeight), 0);
      }
    }, [headerRef, forceCalculate]);

    return (
      <div className="w-full flex flex-col" data-testid="flnc-invoice-table">
        {title && <StyledTitle className="flex flex-start align-center mb-2">{title}</StyledTitle>}
        {showEmpty && isEmpty(rows) && !loading ? (
          <div className={`flex justify-center text-gray-600 py-6 border-2 border-dashed items-center ${emptyContainerClass}`}>
            <div>{emptyTitle}</div>
          </div>
        ) : (
          <div className="w-full align-middle inline-block min-w-full">
            <div className="w-full shadow sm:rounded-lg overflow-x-auto" style={{ borderTop: '1px solid #F0F1F8' }}>
              <table className="w-full divide-y divide-gray-200 border-collapse font-medium overflow-hidden">
                <thead ref={headerRef} style={onTableHeaderHeightChange && { height: `${height}px` }}>
                  <StyledRow className="bg-stone-50" style={{ background: '#FAFAFB' }}>
                    {columns.map((column) => {
                      if (column.hide) return null;
                      const props = {};
                      if (column.tooltip) {
                        props['data-tip'] = column.tooltip;
                      }
                      return (
                        <StyledHeadCell
                          key={column.key}
                          className={`px-3 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            column.key === 'actions' ? 'flex bg-white' : ''
                          } justify-${column.align}`}
                          style={{ background: '#FAFAFB', ...(onTableHeaderHeightChange ? { height: `${height}px` } : {}) }}
                        >
                          <span
                            {...props}
                            onClick={sortColumns && column.sortable ? () => sortColumns(column.key, column.isNumber) : null}
                            className={`flex items-center justify-${column.align} ${column.sortable && sortColumns && 'cursor-pointer'} `}
                          >
                            {column.label}
                            {sortBy === column.key && (
                              <Icon icon={sortDir === 'asc' ? `arrow-up-thin` : 'arrow-down-thin'} style={{ width: '25px', height: '25px' }} />
                            )}
                            {column.tooltip && <Icon icon="info-circle-filled" style={{ marginLeft: '5px', width: '14px', height: '14px' }} />}
                          </span>
                          <ReactTooltip effect="float" className="capitalize" />
                        </StyledHeadCell>
                      );
                    })}
                  </StyledRow>
                </thead>
                <tbody>
                  {rows.map((record, i) => {
                    return (
                      <StyledRow
                        className={`h-14`}
                        key={record.id || i}
                        style={{
                          background: record.bgColor || 'rgba(255, 255, 255, 0.15)',
                          height: rowHeight || (useRecordHeight && record.height) || 'auto',
                        }}
                      >
                        {columns.map((column) => {
                          if (column.hide) return null;
                          return (
                            <StyledBodyCell
                              key={column.key}
                              className={`whitespace-nowrap text-xs py-4 flex-grow-0 md:flex-grow px-3 ${
                                column.key === 'actions' ? 'bg-white' : bodyRowClass
                              }`}
                              style={{ background: record.bgColor || 'rgba(255, 255, 255, 0.15)' }}
                            >
                              {column.key === 'rec-action'
                                ? column.onRender({ ...record, id: record.id || record.invoiceId }, column.key)
                                : column.onRender
                                ? column.onRender({ ...record, id: record.id || record.invoiceId }, column.key)
                                : record[column.key]}
                            </StyledBodyCell>
                          );
                        })}
                      </StyledRow>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }
);

const StyledRow = styled.tr`
  border-bottom: 1px solid #f0f1f8;
`;

const StyledHeadCell = styled.td`
  color: #706a7a;
  letter-spacing: 0.005em;
  font-weight: 500;
  font-size: 12px;
`;

const StyledBodyCell = styled.td`
  color: #706a7a;
  letter-spacing: 0.005em;
  font-size: 14px;
  font-weight: normal;
`;

const StyledTitle = styled.span`
  font-weight: 500;
  font-size: 15px;
  letter-spacing: 0.005em;
  color: #030303;
`;
