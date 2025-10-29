import React, { useState, useEffect } from 'react';
import { PlanTable } from '@client/plan/IMS/components';
import { useToast, localStorageService, Icon, APOLLO_ERROR_MESSAGE, useModal } from '@client/common';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { format } from '@client/utils/number';
import { AUTH_ROUTES } from '@client/auth';
import { RecurringPlanEditModal } from '@client/admin';
import { isEmpty } from 'lodash';

export const OrgRecurringPlans = ({ mode }) => {
  const [list, setList] = useState([]);
  const { addToast } = useToast();
  const { closeModal, openModal, setWidth } = useModal();
  const { orgId } = useParams();

  useEffect(() => {
    getData();
  }, [orgId, mode]);

  const onDeleteRecurringPlan = (log) => {
    try {
      const confirmBox = window.confirm(`Do you really want to delete this recurring plan?`);
      if (confirmBox === false) {
        return;
      }

      let url = `/api/hedge/delete-recurring-plan`;
      const token = localStorageService.getItem('firebase-token');
      const headers = {
        authorization: token,
      };

      axios
        .post(
          url,
          {
            logId: log.id,
          },
          {
            headers: headers,
          }
        )
        .then((res) => {
          addToast(`Recurring plan successfully deleted`);
          getData();
        });
    } catch ({ message }) {
      if (message === APOLLO_ERROR_MESSAGE.authenticationFailed) {
        history.push(AUTH_ROUTES.login);
      } else {
        addToast(message, 'danger');
      }
    }
  };

  const updateRecurring = (payload) => {
    try {
      let url = `/api/hedge/update-recurring-plan`;
      const token = localStorageService.getItem('firebase-token');
      const headers = {
        authorization: token,
      };

      axios.post(url, payload, { headers: headers }).then((res) => {
        closeModal();
        addToast(`Recurring plan successfully updated`);
        getData();
      });
    } catch (e) {
      addToast('Exception occurred... Kindly try again by reloading page.', 'danger');
    }
  };

  const onEditRecurringPlan = (log) => {
    setWidth('40%');
    openModal(<RecurringPlanEditModal plan={log} onSave={updateRecurring} />);
  };

  const getData = () => {
    try {
      let url = `/api/hedge/get-recurring-plans`;
      const token = localStorageService.getItem('firebase-token');
      const headers = {
        authorization: token,
      };

      axios.post(url, { orgId, mode }, { headers: headers }).then((res) => {
        setList(res.data.data.plans);
      });
    } catch (e) {
      addToast('Exception occurred... Kindly try again by reloading page.', 'danger');
    }
  };

  const renderColumn = (r, column) => {
    switch (column) {
      case 'endDate':
        return r[column] != null ? moment(r[column]).format('DD-MMM-YY') : '-';
      case 'capVolume':
        return r[column] != null ? format(Number(r[column]), 2, 3) : '-';
      case 'rec-action':
        return (
          <>
            <a onClick={() => onDeleteRecurringPlan(r)} title="Delete">
              <Icon className="mr-2" icon="delete" title="Delete" />
            </a>
            <a onClick={() => onEditRecurringPlan(r)} title="Edit" className="ml-2">
              <Icon className="mr-2" icon="edit" title="Edit" />
            </a>
          </>
        );
      default:
        return r[column] != null && r[column] != '' ? r[column] : '-';
    }
  };

  const columns = [
    { label: 'Company', key: 'company', onRender: renderColumn },
    { label: 'Currency', key: 'currency', onRender: renderColumn },
    { label: 'Approval Method', key: 'approvalMethod', onRender: renderColumn },
    { label: 'Cap Volume', key: 'capVolume', onRender: renderColumn },
    { label: 'Manage Type', key: 'manageType', onRender: renderColumn },
    { label: 'End Date', key: 'endDate', onRender: renderColumn },
    { label: 'Action', key: 'rec-action', onRender: renderColumn },
  ];

  return (
    <div className=" px-4">
      <span className="text-lg font-bold antialiased text-gray-900">Recurring Plans</span>
      <div className="p-4 flex flex-wrap first:rounded-t-md last:rounded-b-md last:border-b-0 bg-white mt-2 mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        {isEmpty(list) ? (
          <div className="flex w-full text-gray-600">
            <div>Recurring plans not available</div>
          </div>
        ) : (
          <PlanTable rows={list} columns={columns} draggable={false} />
        )}
      </div>
    </div>
  );
};
