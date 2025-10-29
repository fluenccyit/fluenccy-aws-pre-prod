import React, { useEffect, useState } from 'react';
import { localStorageService, APOLLO_ERROR_MESSAGE, FlagIcon, Checkbox, useToast } from '@client/common';
import axios from 'axios';
import styled from 'styled-components';
import { useQueryLocalOrganisation } from '@client/organisation';
import { PlanTable } from '@client/plan/IMS/components';
import { AUTH_ROUTES } from '@client/auth';
import { format } from '@client/utils/number';
import moment from 'moment';

import { useHistory } from 'react-router-dom';
import { PlanTableSkeleton } from '@client/plan';
import { groupBy, sortBy, upperFirst } from 'lodash';
const cuurencyFlagStyle = { width: '22px', height: '22px', style: { marginRight: '5px' } };

export const Archives = ({ formatedList, changeTab }) => {
  const { organisation } = useQueryLocalOrganisation();
  const [invoices, setInvoices] = useState([]);
  const [receivablesInvoices, setReceivablesInvoices] = useState([]);
  const [paidInvoices, setPaidInvoices] = useState([]);
  const [receivablesPricingInvoices, setReceivablesPricingInvoices] = useState([]);
  const [payablesPricingInvoices, setPayablesPricingInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cmsEntitlementsByCurrency, setCmsEntitlementsByCurrency] = useState({});
  const [cmsReceivablesEntitlementsByCurrency, setCmsReceivablesEntitlementsByCurrency] = useState({});
  const history = useHistory();
  const { addToast } = useToast();

  useEffect(() => {
    getCmsInvoices();
    getImsInvoices(false, 'receivables');
    getImsInvoices(true, 'receivables');
    getImsInvoices(true);
    getImsInvoices();
    getCmsEntitlements();
    getCmsEntitlements('receivables');
  }, []);

  const getCmsInvoices = (mode = '') => {
    try {
      try {
        let url = `/api/cms/get-archives`;
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
              mode: mode || null,
            },
            {
              headers: headers,
            }
          )
          .then((res) => {
            setInvoices(
              sortBy(res.data.data.entries, (o) => {
                if (moment(`01-${o.month}-${o.year}`).valueOf() < 0) {
                  return moment(`01/${o.month}/${o.year}`);
                } else {
                  return moment(`01-${o.month}-${o.year}`);
                }
              })
            );

            // setInvoices(sortBy(res.data.data.entries, o => moment(`01/${o.month}/${o.year}`)));
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

  const getImsInvoices = (isPricing = false, mode = '') => {
    try {
      try {
        let url = `/api/hedge/get-archived-invoices`;
        const token = localStorageService.getItem('firebase-token');
        const headers = {
          authorization: token,
        };

        const orgId = organisation?.id;
        const tenantId = organisation?.tenant.id;
        // const isHedging = history.location.pathname == '/plan' ? true : false
        axios
          .post(
            url,
            {
              tenantId: tenantId,
              orgId: orgId,
              currency: 'ALL',
              filter: 12,
              mode: mode || null,
              isPricing,
            },
            {
              headers: headers,
            }
          )
          .then((res) => {
            if (isPricing) {
              if (mode === 'receivables') {
                setReceivablesPricingInvoices(res.data.data.invoices);
              } else {
                setPayablesPricingInvoices(res.data.data.invoices);
              }
            } else {
              if (mode === 'receivables') {
                setReceivablesInvoices(res.data.data.invoices);
              } else {
                setPaidInvoices(res.data.data.invoices);
              }
            }
          })
          .catch((e) => {
            setLoading(false);
          });
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

  const getCmsEntitlements = (mode = '') => {
    try {
      let url = `/api/orgEntitlement/get-cms-entitlements`;
      const token = localStorageService.getItem('firebase-token');
      const headers = {
        authorization: token,
      };

      axios.post(url, { orgId: organisation?.id, isPricing: true, mode: mode || null }, { headers: headers }).then((res) => {
        const results = groupBy(res.data.data.cmsEntitlements, 'currencyCode');
        if (mode === 'receivables') {
          setCmsReceivablesEntitlementsByCurrency(results);
        } else {
          setCmsEntitlementsByCurrency(results);
        }
      });
    } catch (e) {
      addToast('Exception occurred... Kindly try again by reloading page.', 'danger');
    }
  };

  const renderColumn = (r, column) => {
    switch (column) {
      case 'date':
        return moment(r[column]).format('DD MMM YYYY');
      case 'month':
        return (
          <span className={'flex justify-start'} style={r.id === 'total' ? totalStyle : {}}>
            {r.id === 'total' ? 'Totals' : `${r[column]}${r['month'] ? `/${r['year']}` : ''}`}
          </span>
        );
      case 'currencyCode':
      case 'homeCurrencyCode':
        return (
          <span className="flex items-center justify-start">
            <FlagIcon currency={r[column] == "" || r[column] == null ? organisation?.currency : r[column]} style={cuurencyFlagStyle} />
            {r[column] == "" || r[column] == null ? organisation?.currency : r[column]}
          </span>
        );
      case 'forecaseAmount':
        return (
          <span className="flex items-center justify-end" style={{ color: '#1C1336', fontWeight: 500 }}>
            <span style={r.id === 'total' ? totalStyle : {}}>{format(Number(r[column]), 2, 3)}</span>
          </span>
        );
      case 'reservedAmount':
        return (
          <span className="flex items-center justify-end" style={{ color: '#1C1336', fontWeight: 500 }}>
            <span>{r.executedDate ? format(Number(r[column]), 2, 3) : format(Number(r.reserveMin), 2, 3)}</span>
          </span>
        );
      case 'budgetRate':
        return <div className="flex justify-end">{r[column]}</div>;
      case 'reserveMax':
      case 'reserveMin':
        return <span className="flex items-center justify-end">{format(Number(r[column]), 2, 3)}</span>;
      case 'status':
        if (r.executedDate) {
          return (
            <span
              className="text-blue-500 font-medium cursor-pointer underline flex items-center justify-center"
              onClick={() => changeTab({ id: 'trans' })}
            >
              Executed
            </span>
          );
        }
        return <span className="text-red-500 font-medium flex items-center justify-center">Not Submitted</span>;
      case 'type':
        if (!!r.manage_type) {
          return (
            <span style={{ color: '#10BC6A' }}>
              {upperFirst(r[column])} ({r.manage_type === 'Forward' ? 'FWD' : 'PLN'})
            </span>
          );
        } else {
          return <span style={{ color: '#FF6978' }}>{upperFirst(r[column])}</span>;
        }
      case 'overridden':
        return r.buyingSchedule?.overriden ? (
          <span className="flex w-full justify-center">
            <Checkbox isChecked isDisabled className="bg-blue-500 border-blue-500 align-center" />
          </span>
        ) : (
          <span className="flex items-center justify-center">-</span>
        );
      case 'total':
        return <span className="flex items-center justify-start">{format(Number(r[column]), 2, 3)}</span>;
      case 'counterParty':
        let entitlement;
        if (r.mode === 'receivables') {
          entitlement = cmsReceivablesEntitlementsByCurrency[r.currencyCode]?.[0] || {};
        } else {
          entitlement = cmsEntitlementsByCurrency[r.currencyCode]?.[0] || {};
        }
        const { orgEntitlementItems = [] } = entitlement;
        const item = r.counterPartyEntitlementItemId && orgEntitlementItems.find((i) => i.id === parseInt(r.counterPartyEntitlementItemId, 10));
        return <span className="flex items-center justify-start">{item?.text || '-'}</span>;
      default:
        return <span className="flex items-center justify-start">{r[column]}</span>;
    }
  };

  const invoiceColumns = [
    { key: 'month', label: 'Month', onRender: renderColumn, align: 'start' },
    { key: 'currencyCode', label: 'Currency', onRender: renderColumn, align: 'start' },
    { key: 'forecaseAmount', label: 'Forecast Amount', onRender: renderColumn, align: 'end' },
    { key: 'reservedAmount', label: 'Reserved', onRender: renderColumn, align: 'end' },
    { key: 'reserveMax', label: 'Reserve Max', onRender: renderColumn, align: 'end' },
    { key: 'reserveMin', label: 'Reserve Min', onRender: renderColumn, align: 'end' },
    { key: 'budgetRate', label: 'Budget Rate', onRender: renderColumn, align: 'end' },
    { key: 'status', label: 'Status', onRender: renderColumn, align: 'center' },
  ];

  const receivablesInvoiceColumns = [
    { key: 'date', label: 'Invoice Date', onRender: renderColumn },
    { key: 'homeCurrencyCode', label: 'Home Currency', onRender: renderColumn, align: 'start' },
    { key: 'currencyCode', label: 'Currency', onRender: renderColumn, align: 'start' },
    { key: 'invoiceNumber', label: '#', onRender: renderColumn },
    { key: 'contactName', label: 'Company', onRender: renderColumn },
    { key: 'total', label: 'Amount', onRender: renderColumn },
    { key: 'type', label: 'Status', onRender: renderColumn },
    { key: 'overridden', label: 'Overridden', onRender: renderColumn, align: 'center' },
  ];
  const optionsInvoiceColumns = [
    { key: 'date', label: 'Invoice Date', onRender: renderColumn },
    { key: 'homeCurrencyCode', label: 'Home Currency', onRender: renderColumn, align: 'start' },
    { key: 'currencyCode', label: 'Currency', onRender: renderColumn, align: 'start' },
    { key: 'invoiceNumber', label: '#', onRender: renderColumn },
    { key: 'contactName', label: 'Company', onRender: renderColumn },
    { key: 'counterParty', label: 'Provider', onRender: renderColumn },
    { key: 'total', label: 'Amount', onRender: renderColumn },
    { key: 'type', label: 'Status', onRender: renderColumn },
    { key: 'overridden', label: 'Overridden', onRender: renderColumn, align: 'center' },
  ];

  return (
    <>
      <div className="mx-20 relative">
        <StyledTableHeader className="w-full py-1 flex mb-3">Archives</StyledTableHeader>
        {loading ? (
          <PlanTableSkeleton rows={5} columns={15} />
        ) : (
          <PlanTable
            rows={formatedList(invoices)}
            columns={invoiceColumns}
            draggable={false}
            bodyRowClass="bg-red-200"
            showEmpty
            emptyTitle="No records"
          />
        )}
      </div>
      <div className="mx-20 my-4 relative">
        <StyledTableHeader className="w-full py-1 flex mb-3">IMS - Received Invoices</StyledTableHeader>
        {loading ? (
          <PlanTableSkeleton rows={5} columns={15} />
        ) : (
          <PlanTable
            rows={formatedList(receivablesInvoices)}
            columns={receivablesInvoiceColumns}
            draggable={false}
            bodyRowClass="bg-red-200"
            showEmpty
            emptyTitle="No records"
          />
        )}
      </div>
      <div className="mx-20 my-4 relative">
        <StyledTableHeader className="w-full py-1 flex mb-3">IMS - Paid Invoices</StyledTableHeader>
        {loading ? (
          <PlanTableSkeleton rows={5} columns={15} />
        ) : (
          <PlanTable
            rows={formatedList(paidInvoices)}
            columns={receivablesInvoiceColumns}
            draggable={false}
            bodyRowClass="bg-red-200"
            showEmpty
            emptyTitle="No records"
          />
        )}
      </div>
      <div className="mx-20 my-4 relative">
        <StyledTableHeader className="w-full py-1 flex mb-3">CMS Options - Received Invoices</StyledTableHeader>
        {loading ? (
          <PlanTableSkeleton rows={5} columns={15} />
        ) : (
          <PlanTable
            rows={formatedList(receivablesPricingInvoices)}
            columns={optionsInvoiceColumns}
            draggable={false}
            bodyRowClass="bg-red-200"
            showEmpty
            emptyTitle="No records"
          />
        )}
      </div>
      <div className="mx-20 my-4 relative">
        <StyledTableHeader className="w-full py-1 flex mb-3">CMS Options - Paid Invoices</StyledTableHeader>
        {loading ? (
          <PlanTableSkeleton rows={5} columns={15} />
        ) : (
          <PlanTable
            rows={formatedList(payablesPricingInvoices)}
            columns={optionsInvoiceColumns}
            draggable={false}
            bodyRowClass="bg-red-200"
            showEmpty
            emptyTitle="No records"
          />
        )}
      </div>
    </>
  );
};

const StyledTableHeader = styled.div`
  color: #222222;
  font-weight: 500;
  font-size: 20px;
`;
