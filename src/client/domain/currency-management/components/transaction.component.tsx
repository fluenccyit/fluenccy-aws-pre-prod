import React, { useEffect, useMemo, useState } from 'react';
import { localStorageService, APOLLO_ERROR_MESSAGE, FlagIcon } from '@client/common';
import axios from 'axios';
import styled from 'styled-components';
import { useQueryLocalOrganisation } from '@client/organisation';
import { PlanTable } from '@client/plan/IMS/components';
import { AUTH_ROUTES } from '@client/auth';
import { format } from '@client/utils/number';
import moment from 'moment';

import { useHistory } from 'react-router-dom';
import { PlanTableSkeleton } from '@client/plan';
import { sortBy, uniqBy } from 'lodash';
import Select from 'react-select';

const cuurencyFlagStyle = { width: '22px', height: '22px', style: { marginRight: '5px' } };

export const Transactions = () => {
  const { organisation } = useQueryLocalOrganisation();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState();
  const history = useHistory();

  useEffect(() => {
    getInvoice();
  }, []);

  const getInvoice = () => {
    try {
      try {
        let url = `/api/cms/get-transactions`;
        const token = localStorageService.getItem('firebase-token');
        const headers = {
          authorization: token,
        };

        const orgId = organisation?.id;
        axios
          .post(
            url,
            {
              orgId: orgId,
            },
            {
              headers: headers,
            }
          )
          .then((res) => {
            // setInvoices(sortBy(res.data.data.entries, o => moment(`01/${o.month}/${o.year}`)));
            setInvoices(
              sortBy(res.data.data.entries, (o) => {
                if (moment(`01-${o.month}-${o.year}`).valueOf() < 0) {
                  return moment(`01/${o.month}/${o.year}`);
                } else {
                  return moment(`01-${o.month}-${o.year}`);
                }
              })
            );
            setLoading(false);
          })
          .catch((e) => setLoading(false));
      } catch ({ message }) {
        if (message === APOLLO_ERROR_MESSAGE.authenticationFailed) {
          history.push(AUTH_ROUTES.login);
        } else {
          // setIsError(true);
          setLoading(false);
        }
      }
    } catch (e) {}
  };

  const renderColumn = (r, column) => {
    switch (column) {
      case 'month':
        return <span className="flex items-center justify-start">{`${r[column]}${r['year'] ? `/${r['year']}` : ''}`}</span>;
      case 'currencyCode':
        return (
          <span className="flex items-center justify-start">
            <FlagIcon currency={r.currencyCode} style={cuurencyFlagStyle} />
            {r[column]}
          </span>
        );
      case 'reservedAmount':
        return (
          <span className="flex items-center justify-end " style={{ color: '#1C1336', fontWeight: 500 }}>
            <span>{format(Number(r[column]), 2, 3)}</span>
          </span>
        );
      case 'reservedDate':
        return <div className="flex justify-start">{moment(r[column]).format('DD-MMM-YY')}</div>;
      case 'reservedRate':
      case 'currentRate':
        return <div className="flex justify-end">{r[column]}</div>;
      case 'status':
        return <span className="text-green-500 font-medium flex justify-center">Approved</span>;
      default:
        return <span className="flex justify-start">{r[column]}</span>;
    }
  };

  const invoiceColumns = [
    { key: 'month', label: 'Month', onRender: renderColumn, align: 'start' },
    { key: 'currencyCode', label: 'CCY', onRender: renderColumn, align: 'start' },
    { key: 'reservedAmount', label: 'Amount', onRender: renderColumn, align: 'end' },
    { key: 'status', label: 'Status', onRender: renderColumn, align: 'center' },
    { key: 'currentRate', label: 'Current Rate', onRender: renderColumn, align: 'end' },
    { key: 'reservedRate', label: 'Executed Rate', onRender: renderColumn, align: 'end' },
    { key: 'reservedDate', label: 'Executed Date', onRender: renderColumn, align: 'start' },
  ];

  const months = useMemo(() => {
    const ms = uniqBy(
      invoices.map((o) => ({ label: `${o.month}/${o.year}`, value: `${o.month}/${o.year}` })),
      'value'
    );
    ms.unshift({ label: 'All', value: 'all' });
    return ms;
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    if (selectedMonth && selectedMonth.value !== 'all') {
      return invoices.filter((o) => `${o.month}/${o.year}` === selectedMonth.value);
    }
    return invoices;
  }, [selectedMonth, invoices]);

  return (
    <div className="mx-20 relative">
      <StyledTableHeader className="w-full py-1 flex mb-3 items-center justify-between">
        <span>All Transactions</span>
        <div className="flex items-center font-normal text-base">
          <span>Filter:</span>
          <Select
            defaultValue={months[0]}
            options={months}
            onChange={setSelectedMonth}
            value={selectedMonth}
            closeMenuOnSelect
            placeholder="Select Month"
            className="ml-2 w-40"
          />
        </div>
      </StyledTableHeader>
      {loading ? (
        <PlanTableSkeleton rows={5} columns={15} />
      ) : (
        <PlanTable rows={filteredInvoices} columns={invoiceColumns} draggable={false} bodyRowClass="bg-red-200" showEmpty emptyTitle="No records" />
      )}
    </div>
  );
};

const StyledTableHeader = styled.div`
  color: #222222;
  font-weight: 500;
  font-size: 20px;
`;
