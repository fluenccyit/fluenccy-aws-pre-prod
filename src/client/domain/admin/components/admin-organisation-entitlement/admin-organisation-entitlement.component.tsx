import React, { useEffect, useState } from 'react';
import { EntitlementItem } from '@client/admin';
import { useToast, localStorageService } from '@client/common';
import axios from 'axios';

export const OrgEntitlements = ({ data, orgId, callback, mode }) => {
  const [values, setValues] = useState(data);
  const { addToast } = useToast();

  useEffect(() => {
    setValues(data);
  }, [data]);

  const onChange = (field: string, value: Number) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const onSave = (field, value, cb) => {
    try {
      let url = data.id ? '/api/orgEntitlement/update-OrgEntitlements' : `/api/orgEntitlement/create-OrgEntitlement`;
      const token = localStorageService.getItem('firebase-token');
      const headers = {
        authorization: token,
      };
      const {
        id,
        forwardPercentage,
        minForwardPercent,
        maxForwardPercent,
        spotPercentage,
        marginPercentage,
        hedgeAdjustment,
        EFTAdjustment,
        orderAdjustmentMinus,
        orderAdjustmentPlus,
        minPercentAboveSpot,
        maxPercentOnOrder,
        orderProbability,
        minimumProbability,
        maximumProbability,
        forwardMarginPercentage,
        limitOrderMarginPercentage,
        spotMarginPercentage,
        setOptimised,
        showInversedRate,
      } = data;
      const payload = {
        mode,
        orgId,
        forwardPercentage,
        spotPercentage,
        marginPercentage,
        hedgeAdjustment,
        EFTAdjustment,
        orderAdjustmentPlus,
        orderAdjustmentMinus,
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
        [field]: typeof value == 'boolean' ? value : value || values[field],
      };
      if (id) {
        payload.id = id;
      }

      axios
        .post(url, payload, { headers: headers })
        .then((res) => {
          callback();
          addToast('Data saved successfully.', 'success');
          cb();
        })
        .catch((e) => addToast('Failed to save.', 'danger', 'fixed'));
    } catch (e) {
      console.log(e);
      addToast('Exception occurred... Kindly try again by reloading page.', 'danger', 'fixed');
    }
  };

  const onCancel = (field) => {
    setValues((prev) => ({ ...prev, [field]: data[field] }));
  };

  const ITEMS = [
    {
      title: 'Client Margin',
      key: 'marginPercentage',
      postFix: '%',
      preFix: '',
      default: 0.6,
    },
    {
      title: 'Forward',
      key: 'forwardPercentage',
      range: {
        min: 10,
        max: 25,
      },
      postFix: '%',
      default: 25,
    },
    {
      title: 'Min Forward',
      key: 'minForwardPercent',
      range: {
        min: 10,
        max: values.maxForwardPercent && values.maxForwardPercent > 0 ? values.maxForwardPercent : 25,
      },
      postFix: '%',
      default: 10,
    },
    {
      title: 'Max Forward',
      key: 'maxForwardPercent',
      range: {
        min: values.minForwardPercent && values.minForwardPercent > 0 ? values.minForwardPercent : 10,
        max: 25,
      },
      postFix: '%',
      default: 25,
    },
    {
      title: 'Spot',
      key: 'spotPercentage',
      postFix: '%',
      preFix: '',
      default: 10,
    },
    {
      title: 'Order Adjustment +',
      key: 'orderAdjustmentPlus',
      postFix: '%',
      preFix: '+',
      default: 25,
    },
    {
      title: 'Order Adjustment -',
      key: 'orderAdjustmentMinus',
      postFix: '%',
      preFix: '-',
      default: 10,
    },
    {
      title: 'Hedge Adjustment',
      key: 'hedgeAdjustment',
      default: 1,
    },
    {
      title: 'EFT Adjustment',
      key: 'EFTAdjustment',
      postFix: '%',
      preFix: '',
      default: 0,
    },
    {
      title: 'Min % above Spot',
      key: 'minPercentAboveSpot',
      range: {
        min: 0,
      },
      postFix: '%',
      preFix: '',
    },
    {
      title: 'Max % on Order',
      key: 'maxPercentOnOrder',
      range: {
        max: 90,
      },
      postFix: '%',
      preFix: '',
    },
    {
      title: 'Forward Margin Percentage',
      key: 'forwardMarginPercentage',
      postFix: '%',
      preFix: '',
      default: 0.5,
    },
    {
      title: 'Order Margin Percentage',
      key: 'limitOrderMarginPercentage',
      postFix: '%',
      preFix: '',
      default: 0.5,
    },
    {
      title: 'Spot Margin Percentage',
      key: 'spotMarginPercentage',
      postFix: '%',
      preFix: '',
      default: 0.5,
    },
    {
      title: 'Minimum Probability',
      key: 'minimumProbability',
      range: {
        min: 1,
        max: 100,
      },
      postFix: '%',
      preFix: '',
      default: 5,
    },
    {
      title: 'Order Probability',
      key: 'orderProbability',
      range: {
        min: 1,
        max: 100,
      },
      postFix: '%',
      preFix: '',
      default: 80,
    },
    {
      title: 'Maximum Probability',
      key: 'maximumProbability',
      range: {
        min: 1,
        max: 100,
      },
      postFix: '%',
      preFix: '',
      default: 90,
    },
    {
      title: 'Variable Probability Toggle',
      key: 'setOptimised',
      type: 'SWITCH',
      default: false,
    },
    {
      title: 'Show Inversed Rate',
      key: 'showInversedRate',
      type: 'SWITCH',
      default: false,
    },
  ];

  return (
    <div className="py-8 px-4">
      <span className="text-lg font-bold antialiased text-gray-900">Entitlements</span>
      <div className="p-4 first:rounded-t-md last:rounded-b-md last:border-b-0 bg-white mt-2 mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        {ITEMS.map((item) => (
          <EntitlementItem key={item.key} data={item} onChange={onChange} value={values[item.key]} onCancel={onCancel} onSave={onSave} />
        ))}
      </div>
    </div>
  );
};
