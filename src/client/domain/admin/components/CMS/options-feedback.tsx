import React, { useEffect, useState } from 'react';
import { useToast, localStorageService, FluenccyLoader, FlagIcon, Badge, useModal, APOLLO_ERROR_MESSAGE, Checkbox, Select } from '@client/common';
import axios from 'axios';
import styled from 'styled-components';
import { useQueryLocalOrganisation } from '@client/organisation';
import moment from 'moment';
import { ActionTooltipContent, PlanTable, ScheduleModal } from '@client/plan/IMS/components';
import { AUTH_ROUTES } from '@client/auth';
import { format } from '@client/utils/number';

import { groupBy, upperFirst } from 'lodash';
import { useHistory } from 'react-router-dom';

const cuurencyFlagStyle = { width: '22px', height: '22px', style: { marginRight: '5px' } };

export const AdminOrganisationCmsOptionFeedback = ({ entitlements, receivableEntitlements }) => {
  const { organisation } = useQueryLocalOrganisation();
  const [invoices, setInvoices] = useState([]);
  const [receivablesInvoices, setReceivablesInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingReceivables, setLoadingReceivables] = useState(true);
  const { openModal, setWidth, closeModal, modal } = useModal();
  const [cmsEntitlementsByCurrency, setCmsEntitlementsByCurrency] = useState({});
  const [cmsReceivablesEntitlementsByCurrency, setCmsReceivablesEntitlementsByCurrency] = useState({});
  const history = useHistory();

  useEffect(() => {
    getInvoice();
    getInvoice('', 'receivables');
    getCmsEntitlements();
    getCmsEntitlements('receivables');
  }, [modal]);

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
      // addToast('Exception occurred... Kindly try again by reloading page.', 'danger');
    }
  };

  const getInvoice = (showModalFor = '', mode = '') => {
    try {
      try {
        let url = `/api/hedge/get-invoices`;
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
              type: 'managed',
              isApproved: true,
              isPricing: true,
              view: 'feedback',
              mode: mode || null,
            },
            {
              headers: headers,
            }
          )
          .then((res) => {
            if (mode) {
              setReceivablesInvoices(res.data.data.invoices);
              setLoadingReceivables(false);
            } else {
              setInvoices(res.data.data.invoices);
              setLoading(false);
            }
            if (showModalFor) {
              showSchedule(res.data.data.invoices.find((inv) => inv.invoiceId === showModalFor));
            }
          })
          .catch((e) => {
            if (mode) {
              setLoadingReceivables(false);
            } else {
              setLoading(false);
            }
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

  const onMarkAsPaid = (r, showModalFor = '') => {
    try {
      try {
        const confirmBox = window.confirm(`Do you really want to mark this invoice as ${r.mode === 'receivables' ? 'RECEIVED' : 'PAID'}?`);
        if (confirmBox === false) {
          return;
        }

        let url = `/api/hedge/mark-as-paid-and-received`;
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
              invoiceId: r.invoiceId,
            },
            {
              headers: headers,
            }
          )
          .then((res) => {
            if (r.mode) {
              getInvoice('', 'receivables');
            } else {
              getInvoice();
            }
            closeModal();
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

  const isShowMarkAsPaid = (r) => {
    const {
      executedForwardDate,
      executedForwardRate,
      executedForwardValue,
      executedOrderDate,
      executedOrderRate,
      executedOrderValue,
      executedSpotDate,
      executedSpotRate,
      executedSpotValue,
    } = r.buyingSchedule || {};
    return r.manage_type == 'Plan' && r.buyingSchedule.isHedgedEverything == false
      ? !!executedForwardValue &&
          !!executedForwardRate &&
          !!executedForwardDate &&
          !!executedOrderDate &&
          !!executedOrderRate &&
          !!executedOrderValue &&
          !!executedSpotDate &&
          !!executedSpotRate &&
          !!executedSpotValue
      : !!executedForwardValue && !!executedForwardRate && !!executedForwardDate;
  };

  const showSchedule = (r, v = '') => {
    switch (v) {
      case 'markAsPaidAndReceived':
        onMarkAsPaid(r);
        break;
      default:
        setWidth('40%');
        openModal(
          <ScheduleModal
            title="Monitoring"
            invoice={r}
            organisation={organisation}
            editable
            cb={(id) => getInvoice(id, r.mode)}
            onMarkAsPaid={() => onMarkAsPaid(r)}
            showMarkAsPaidBtn={isShowMarkAsPaid(r)}
            isHedgingEverything={false}
            entitlements={r.mode === 'receivables' ? receivableEntitlements : entitlements}
          />
        );
    }
  };

  const renderColumn = (r, column) => {
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

      case 'daysToPay':
        const dtp = moment(r.dateDue).diff(moment(), 'days');
        return dtp > 0 ? dtp : 0;
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
        return (
          r.buyingSchedule?.overriden && (
            <span className="flex w-full justify-center">
              <Checkbox isChecked isDisabled className="bg-blue-500 border-blue-500 align-center" />
            </span>
          )
        );
      case 'actions':
        const options = [{ label: 'Update', value: 'update' }];
        if (isShowMarkAsPaid(r) && !r.isMarkedAsPaid && !r.isMarkedAsReceived) {
          options.push({ label: r.mode ? 'Mark as Received' : 'Mark as Paid', value: 'markAsPaidAndReceived' });
        }
        return <ActionTooltipContent options={options} onSelect={showSchedule.bind(null, r)} currency={organisation?.currency} />;
      // case 'pricingLabelField':
      //   let entitlement = 'IMS';
      //   if (r.mode === 'receivables') {
      //     entitlement = cmsReceivablesEntitlementsByCurrency[r.currencyCode]?.[0] || {};
      //   } else {
      //     entitlement = cmsEntitlementsByCurrency[r.currencyCode]?.[0] || {};
      //   }
      //   return entitlement[`pricingOption${r[column]}Label`] || 'IMS';
      case 'counterParty':
        let entitlement;
        if (r.mode === 'receivables') {
          entitlement = cmsReceivablesEntitlementsByCurrency[r.currencyCode]?.[0] || {};
        } else {
          entitlement = cmsEntitlementsByCurrency[r.currencyCode]?.[0] || {};
        }
        const { orgEntitlementItems = [] } = entitlement;
        const item = r.counterPartyEntitlementItemId && orgEntitlementItems.find((i) => i.id === parseInt(r.counterPartyEntitlementItemId, 10));
        return item?.text || '-';
      default:
        return r[column];
    }
  };

  const invoiceColumns = [
    { key: 'date', label: 'Invoice Date', onRender: renderColumn },
    { key: 'invoiceNumber', label: '#', onRender: renderColumn },
    { key: 'contactName', label: 'Company', onRender: renderColumn },
    { key: 'dateDue', label: 'Expected Date', onRender: renderColumn },
    { key: 'total', label: 'Amount', onRender: renderColumn },
    { key: 'daysToPay', label: 'Days to Receive', onRender: renderColumn },
    { key: 'type', label: 'Status', onRender: renderColumn },
    { key: 'counterParty', label: 'Provider', onRender: renderColumn },
    { key: 'actions', label: 'Actions', onRender: renderColumn, align: 'center' },
  ];

  return (
    <div className="mx-20">
      <div className="my-10">
        <StyledTableHeader className="w-full py-1 flex mb-3">Feedback for Options - Payables</StyledTableHeader>
        <PlanTable
          emptyContainerClass="h-12"
          rows={invoices}
          columns={invoiceColumns}
          draggable={false}
          bodyRowClass="bg-red-200"
          emptyTitle="No Records"
          loading={loading}
        />
        {loading && (
          <div className="flex w-full justify-center">
            <FluenccyLoader style={{ width: '70px' }} />
          </div>
        )}
      </div>
      <div className="my-10">
        <StyledTableHeader className="w-full py-1 flex mb-3">Feedback for Options - Receivables</StyledTableHeader>
        <PlanTable
          rows={receivablesInvoices}
          columns={invoiceColumns}
          draggable={false}
          bodyRowClass="bg-red-200"
          emptyTitle="No Records"
          loading={loading}
          emptyContainerClass="h-12"
        />
        {loadingReceivables && (
          <div className="flex w-full justify-center">
            <FluenccyLoader style={{ width: '70px' }} />
          </div>
        )}
      </div>
    </div>
  );
};

const StyledTableHeader = styled.div`
  color: #222222;
  font-weight: 500;
  font-size: 20px;
`;
