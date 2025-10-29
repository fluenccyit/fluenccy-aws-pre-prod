import React, { useState, useEffect } from 'react';
import { FinancialProductsItem } from '@client/admin';
import { useToast, localStorageService } from '@client/common';
import axios from 'axios';
import { useParams } from 'react-router-dom';

export const OrgFinancialProduct = ({ mode }) => {
  const [lists, setLists] = useState([]);
  const { addToast } = useToast();
  const { orgId } = useParams();

  useEffect(() => {
    getData();
  }, [orgId, mode]);

  const getData = () => {
    try {
      let url = `/api/financialProducts/get-all-financial-products`;
      const token = localStorageService.getItem('firebase-token');
      const headers = {
        authorization: token,
      };

      axios.post(url, { mode }, { headers: headers }).then((res) => {
        setLists(res.data.data.FinancialProducts);
      });
    } catch (e) {
      addToast('Exception occurred... Kindly try again by reloading page.', 'danger');
    }
  };

  const onSave = (data, cb) => {
    try {
      let url = '/api/financialProducts/create-financial-product';
      const token = localStorageService.getItem('firebase-token');
      const headers = {
        authorization: token,
      };

      const payload = {
        orgId,
        title: data.title,
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
      <span className="text-lg font-bold antialiased text-gray-900">Financial products</span>
      <div className="p-4 flex flex-wrap first:rounded-t-md last:rounded-b-md last:border-b-0 bg-white mt-2 mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        {lists.map((item) => (
          <FinancialProductsItem key={item.created_at} data={item} value={item.title} />
        ))}
        <FinancialProductsItem onSave={onSave} isNew />
      </div>
    </div>
  );
};
