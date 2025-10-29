import React, { useEffect, useState } from 'react';
import {
  OrgEntitlements,
  OrgFinancialProduct,
  OrgFinancialInstitute,
  OrgEmailNotification,
  OrgRecurringPlans,
  OrgCMSEntitlement,
} from '@client/admin';
import { useParams } from 'react-router-dom';
import { useToast, localStorageService, FluenccyLoader, Select } from '@client/common';
import axios from 'axios';

const defaultValues = {
  marginPercentage: 0.6,
  forwardPercentage: 25,
  spotPercentage: 10,
  orderAdjustmentPlus: 25,
  orderAdjustmentMinus: 10,
  hedgeAdjustment: 1,
  EFTAdjustment: 0,
  orderProbability: 0.8,
  minimumProbability: 0.05,
  maximumProbability: 0.9,
  forwardMarginPercentage: 0.5,
  limitOrderMarginPercentage: 0.5,
  spotMarginPercentage: 0.5,
  setOptimised: false,
  showInversedRate: false,
};

const options = [
  {
    value: 'payables',
    label: 'Payables',
  },
  {
    value: 'receivables',
    label: 'Receivables',
  },
];

export const OrgEntitlementContainer = () => {
  const [values, setValues] = useState(defaultValues);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState(options[0].value);
  const { addToast } = useToast();
  const { orgId } = useParams();

  const selectedMode = mode === 'payables' ? null : mode;

  useEffect(() => {
    getData();
  }, [orgId, mode]);

  const getData = () => {
    setLoading(true);
    try {
      let url = `/api/orgEntitlement/get-OrgEntitlements`;
      const token = localStorageService.getItem('firebase-token');
      const headers = {
        authorization: token,
      };

      const payload = {
        orgId,
        mode: selectedMode,
      };

      axios.post(url, payload, { headers: headers }).then((res) => {
        let data = defaultValues;
        if (res.data.data.OrgEntitlements[0]) {
          const {
            id,
            orgId,
            forwardPercentage,
            spotPercentage,
            marginPercentage,
            hedgeAdjustment,
            EFTAdjustment,
            orderAdjustmentMinus,
            orderAdjustmentPlus,
            fi_name = '',
            fi_email = '',
            minPercentAboveSpot,
            maxPercentOnOrder,
            minForwardPercent,
            maxForwardPercent,
            orderProbability,
            minimumProbability,
            maximumProbability,
            forwardMarginPercentage,
            limitOrderMarginPercentage,
            spotMarginPercentage,
            setOptimised,
            showInversedRate,
          } = res.data.data.OrgEntitlements[0];
          data = {
            id,
            orgId,
            forwardPercentage,
            spotPercentage,
            marginPercentage,
            hedgeAdjustment,
            EFTAdjustment,
            orderAdjustmentPlus,
            orderAdjustmentMinus,
            fi_email,
            fi_name,
            minPercentAboveSpot,
            maxPercentOnOrder,
            minForwardPercent,
            maxForwardPercent,
            orderProbability,
            minimumProbability,
            maximumProbability,
            forwardMarginPercentage,
            limitOrderMarginPercentage,
            spotMarginPercentage,
            setOptimised,
            showInversedRate,
          };
        }
        setValues(data);
        setLoading(false);
      });
    } catch (e) {
      addToast('Exception occurred... Kindly try again by reloading page.', 'danger');
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <FluenccyLoader />}
      <div className="flex justify-center mt-6">
        <Select options={options} value={mode} onChange={setMode} isDisabled={false} style={{ width: '200px' }} />
      </div>
      <OrgEntitlements data={values} orgId={orgId} callback={getData} mode={selectedMode} />
      <OrgFinancialProduct mode={selectedMode} />
      <OrgFinancialInstitute data={values} orgId={orgId} callback={getData} mode={selectedMode} />
      <OrgEmailNotification mode={selectedMode} />
      <OrgRecurringPlans mode={selectedMode} />
      <OrgCMSEntitlement mode={selectedMode} />
    </>
  );
};
