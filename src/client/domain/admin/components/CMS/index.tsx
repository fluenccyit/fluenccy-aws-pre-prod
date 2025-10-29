import React, { useEffect, useRef, useState } from 'react';
import { useToast, localStorageService, FluenccyLoader, FlagIcon, Badge, useModal, APOLLO_ERROR_MESSAGE, Button, Input, Icon } from '@client/common';
import axios from 'axios';
import styled from 'styled-components';
import { useQueryLocalOrganisation } from '@client/organisation';
import moment from 'moment';
import { ActionTooltipContent, PlanTable, ScheduleModal } from '@client/plan/IMS/components';
import { AUTH_ROUTES } from '@client/auth';
import { format } from '@client/utils/number';

import { sortBy, upperFirst } from 'lodash';
import { useHistory } from 'react-router-dom';
import { AdminOrganisationCmsOptionFeedback } from './options-feedback';

const cuurencyFlagStyle = { width: '22px', height: '22px', style: { marginRight: '5px' } };
const iconStyle = {
  width: '18px',
  height: '18px',
  cursor: 'pointer',
  marginLeft: '10px',
};

export const AdminOrganisationCms = () => {
  const { organisation } = useQueryLocalOrganisation();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editableId, setEditableId] = useState();
  const [homeEditableId, setHomeEditableId] = useState();
  const [reservedRate, setReservedRate] = useState();
  const [reservedDate, setReservedDate] = useState();
  const [homeCurrencyValue, setHomeCurrencyValue] = useState();
  const [submitting, setSubmitting] = useState(false);
  const history = useHistory();
  const inputRef = useRef();

  useEffect(() => {
    getInvoice();
  }, []);

  const onEdit = (r) => {
    setEditableId(r.id);
    setHomeEditableId(r.id);
    setHomeCurrencyValue('');
    setReservedRate('');
    setTimeout(() => inputRef.current.focus(), 100);
  };

  const onEditHome = (r) => {
    setHomeEditableId(r.id);
  };

  const onCancel = () => {
    setEditableId('');
    setReservedDate('');
    setReservedRate('');
    setHomeEditableId('');
    setHomeCurrencyValue('');
  };

  const onDateChange = (e, r) => {
    if (!editableId) {
      setEditableId(r.id);
    }
    setReservedDate(e.target.value);
  };

  const onReservedRateChange = (e, r) => {
    const { value } = e.target;
    setReservedRate(value);
    setHomeCurrencyValue(((1 / Number(value)) * (Number(r.reservedAmount) || 1)).toFixed(2));
  };

  const getInvoice = () => {
    try {
      try {
        let url = `/api/cms/get-feedbacks`;
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
            // if(moment(`01-${o.month}-${o.year}`).valueOf() < 0) {
            //   setInvoices(sortBy(res.data.data.entries, o => moment(`01/${o.month}/${o.year}`)));
            // } else {
            //   setInvoices(sortBy(res.data.data.entries, o => moment(`01-${o.month}-${o.year}`)));
            // }
            // setInvoices(sortBy(res.data.data.entries, o => moment(`${o.month}-${o.year}`)));
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

  const onSubmit = (r) => {
    try {
      try {
        setSubmitting(true);
        const confirmBox = window.confirm(`Do you really want to submit ?`);
        if (confirmBox === false) {
          return;
        }

        let url = `/api/cms/update-feedback`;
        const token = localStorageService.getItem('firebase-token');
        const headers = {
          authorization: token,
        };

        axios
          .post(
            url,
            {
              id: r.id,
              // 'crm_entry_id': r.crm_entry_id,
              // 'crm_import_log_id': r.crm_import_log_id,
              reservedAmount: r.reservedAmount,
              reservedDate,
              reservedRate,
              homeCurrencyAmount: Number(homeCurrencyValue),
            },
            {
              headers: headers,
            }
          )
          .then((res) => {
            getInvoice();
            onCancel();
            setSubmitting(false);
          })
          .catch((e) => {
            setLoading(false);
            setSubmitting(false);
          });
      } catch ({ message }) {
        if (message === APOLLO_ERROR_MESSAGE.authenticationFailed) {
          history.push(AUTH_ROUTES.login);
        } else {
          // setIsError(true);
          setSubmitting(false);
          setLoading(false);
        }
      }
    } catch (e) {}
  };

  const renderColumn = (r, column) => {
    switch (column) {
      case 'month':
        return <span>{`${r[column]}${r['year'] ? `/${r['year']}` : ''}`}</span>;
      case 'currencyCode':
        return (
          <span className="flex items-center " style={{ color: '#1C1336', fontWeight: 500 }}>
            <FlagIcon currency={r.currencyCode} style={cuurencyFlagStyle} /> <span>{r[column]}</span>
          </span>
        );
      case 'reservedAmount':
        return (
          <span className="flex items-center " style={{ color: '#1C1336', fontWeight: 500 }}>
            <span>{format(Number(r[column]), 2, 3)}</span>
          </span>
        );
      case 'reservedRate':
        return (
          <div>
            {r.id === editableId ? (
              <Input type="number" ref={inputRef} onChange={(e) => onReservedRateChange(e, r)} value={reservedRate} className="p-1" />
            ) : (
              <Icon icon="edit" onClick={() => onEdit(r)} style={iconStyle} />
            )}
          </div>
        );
      case 'reservedDate':
        return (
          <div className="flex">
            <Input
              value={r.id === editableId ? reservedDate : ''}
              max={moment().format('YYYY-MM-DD')}
              onChange={(d) => onDateChange(d, r)}
              type="date"
              className="right"
            />
          </div>
        );
      case 'status':
        return <span className="text-green-500 font-medium">Approved</span>;
      case 'homeCurrency':
        return (
          <div>
            {r.id === homeEditableId ? (
              <Input
                type="number"
                placeholder="Home currency amount"
                onChange={(e) => setHomeCurrencyValue(e.target.value)}
                value={homeCurrencyValue}
                className="p-1"
              />
            ) : (
              <Icon icon="edit" onClick={() => onEditHome(r)} style={iconStyle} />
            )}
          </div>
        );
      case 'actions':
        const isDisabled = r.id === editableId && (!reservedDate || !reservedRate || !homeCurrencyValue || submitting);
        return (
          <div className="flex items-center justify-around">
            <Button isDisabled={isDisabled} onClick={() => onSubmit(r)}>
              {submitting && r.id === editableId ? 'Submitting...' : 'Submit'}
            </Button>
            {editableId === r.id && !submitting && <Button onClick={onCancel}>Cancel</Button>}
          </div>
        );
      default:
        return r[column];
    }
  };

  const invoiceColumns = [
    { key: 'month', label: 'Month', onRender: renderColumn },
    { key: 'currencyCode', label: 'CCY', onRender: renderColumn },
    { key: 'reservedAmount', label: 'Amount', onRender: renderColumn },
    { key: 'status', label: 'Status', onRender: renderColumn },
    { key: 'currentRate', label: 'Current Rate', onRender: renderColumn },
    { key: 'reservedRate', label: 'Executed Rate', onRender: renderColumn },
    { key: 'reservedDate', label: 'Executed Date', onRender: renderColumn },
    { key: 'homeCurrency', label: 'Home Currency Amount', onRender: renderColumn },
    { key: 'actions', label: 'Actions', onRender: renderColumn, align: 'center' },
  ];

  return (
    <>
      <div className="mx-20 relative">
        <StyledTableHeader className="w-full py-1 flex mb-3">CMS Feedback</StyledTableHeader>
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
      <AdminOrganisationCmsOptionFeedback organisation={organisation} />
    </>
  );
};

const StyledTableHeader = styled.div`
  color: #222222;
  font-weight: 500;
  font-size: 20px;
`;
