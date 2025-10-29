import React, { useState, useEffect } from 'react';
import { OrgFinancialInstituteItem } from '@client/admin';
import { useToast, localStorageService } from '@client/common';
import axios from 'axios';

const ITEMS = [
  {
    title: 'Name',
    key: 'fi_name',
    placeholder: 'Enter name',
  },
  {
    title: 'Email',
    key: 'fi_email',
    placeholder: 'Enter email',
  },
];

export const OrgFinancialInstitute = ({ data, orgId, callback, mode }) => {
  const [values, setValues] = useState(data);
  const { addToast } = useToast();

  useEffect(() => {
    setValues(data);
  }, [data]);

  const onChange = (field: string, value: Number) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const onSave = (field, cb) => {
    try {
      let url = '/api/orgEntitlement/update-FinancialInstitute';
      const token = localStorageService.getItem('firebase-token');
      const headers = {
        authorization: token,
      };

      const payload = {
        orgId,
        mode,
        fi_name: values.fi_name,
        fi_email: values.fi_email,
        [field]: values[field],
      };

      axios
        .post(url, payload, { headers: headers })
        .then((res) => {
          callback();
          addToast('Data saved successfully.', 'success', 'fixed');
          cb();
        })
        .catch((e) => addToast('Failed to save.', 'danger', 'fixed'));
    } catch (e) {
      addToast('Exception occurred... Kindly try again by reloading page.', 'danger', 'fixed');
    }
  };

  const onCancel = (field) => {
    setValues((prev) => ({ ...prev, [field]: data[field] }));
  };

  return (
    <div className="px-4">
      <span className="text-lg font-bold antialiased text-gray-900">Financial Institute</span>
      <div className="p-4 first:rounded-t-md last:rounded-b-md last:border-b-0 bg-white mt-2 mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        {ITEMS.map((item) => (
          <OrgFinancialInstituteItem key={item.key} data={item} onChange={onChange} value={values[item.key]} onCancel={onCancel} onSave={onSave} />
        ))}
      </div>
    </div>
  );
};
