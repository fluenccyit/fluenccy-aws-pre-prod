import React, { useState, useEffect } from 'react';
import { EntitlementItem } from '@client/admin';
import { useToast, localStorageService } from '@client/common';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const data = {
  title: 'Notification Email',
  key: 'plan_approval_email',
  type: 'email',
};

export const OrgEmailNotification = ({ mode }) => {
  const [email, setEmail] = useState();
  const { addToast } = useToast();
  const { orgId } = useParams();

  useEffect(() => {
    getData();
  }, [orgId, mode]);

  const getData = () => {
    try {
      let url = `/api/orgEntitlement/get-PlanApprovalEmail`;
      const token = localStorageService.getItem('firebase-token');
      const headers = {
        authorization: token,
      };

      axios.post(url, { orgId, mode }, { headers: headers }).then((res) => {
        setEmail(res.data.data[0].plan_approval_email || '');
      });
    } catch (e) {
      addToast('Exception occurred... Kindly try again by reloading page.', 'danger');
    }
  };

  const onSave = (data, _, cb) => {
    try {
      let url = '/api/orgEntitlement/update-PlanApprovalEmail';
      const token = localStorageService.getItem('firebase-token');
      const headers = {
        authorization: token,
      };

      const payload = {
        orgId,
        plan_approval_email: email,
        mode,
      };

      axios
        .post(url, payload, { headers: headers })
        .then((res) => {
          addToast('Data saved successfully.', 'success');
          getData();
          cb();
        })
        .catch((e) => addToast('Failed to save.', 'danger'));
    } catch (e) {
      addToast('Exception occurred... Kindly try again by reloading page.', 'danger');
    }
  };

  return (
    <div className=" px-4">
      <span className="text-lg font-bold antialiased text-gray-900">Plan Approval Notification email</span>
      <div className="p-4 flex flex-wrap first:rounded-t-md last:rounded-b-md last:border-b-0 bg-white mt-2 mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <EntitlementItem data={data} onChange={(field, v) => setEmail(v)} value={email} onCancel={() => getData()} onSave={onSave} />
      </div>
    </div>
  );
};
