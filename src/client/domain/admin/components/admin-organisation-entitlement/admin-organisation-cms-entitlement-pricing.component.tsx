import React, { useState, useEffect } from 'react';
import { EntitlementItem } from './admin-organisation-entitlement-item.component';
import axios from 'axios';
import { localStorageService, useToast } from '@client/common';
import { text } from 'express';

const validate = (v) => {
  const vParts = v.split('.');
  if (vParts[1]?.length > 5) {
    return `${vParts[0]}.${vParts[1].substr(0, 5)}`;
  }
  return v;
};

export const OrgCMSPricingEntitlement = ({ orgId, callback, currency, mode }) => {
  const [lists, setLists] = useState([]);
  const [selectedItem, setSelectedItem] = useState();
  const [record, setRecord] = useState();
  const [optionLabels, setOptionLabels] = useState({
    pricingOption1Label: '',
    pricingOption2Label: '',
    pricingOption3Label: '',
  });
  const { addToast } = useToast();

  useEffect(() => {
    setLists([]);
  }, [mode]);

  useEffect(() => {
    if (currency) {
      getData();
    }
  }, [currency, mode]);

  useEffect(() => {
    if (currency && lists.length) {
      const record = lists.find((o) => o.currencyCode === currency.value);
      setRecord(record);
    }
  }, [currency]);

  const getData = () => {
    try {
      let url = `/api/orgEntitlement/get-cms-entitlements`;
      const token = localStorageService.getItem('firebase-token');
      const headers = {
        authorization: token,
      };

      axios.post(url, { orgId, isPricing: true, mode }, { headers: headers }).then((res) => {
        const results = res.data.data.cmsEntitlements;
        setLists(results);
        const record = results.find((o) => o.currencyCode === currency.value);
        setRecord(record);
        setOptionLabels({
          pricingOption1Label: record?.pricingOption1Label || '',
          pricingOption2Label: record?.pricingOption2Label || '',
          pricingOption3Label: record?.pricingOption3Label || '',
        });
      });
    } catch (e) {
      addToast('Exception occurred... Kindly try again by reloading page.', 'danger');
    }
  };

  const onChangeField = (k, v) => {
    if (selectedItem) {
      setSelectedItem({ ...selectedItem, min: v || null, name: k });
    } else {
      const { orgEntitlementItems } = record || {};
      let item = orgEntitlementItems?.find((o) => o.name === k);
      if (item) {
        item.min = v;
      } else {
        item = {
          name: k,
          min: v || null,
        };
      }
      setSelectedItem(item);
    }
  };

  const onCounterPartyChange = (k, v) => {
    if (selectedItem) {
      setSelectedItem({ ...selectedItem, text: v || '', name: k });
    } else {
      const { orgEntitlementItems } = record || {};
      let item = orgEntitlementItems?.find((o) => o.name === k);
      if (item) {
        item.text = v;
      } else {
        item = {
          name: k,
          text: v || '',
        };
      }
      setSelectedItem(item);
    }
  };

  const onSave = (k, v, cb) => {
    try {
      let url = `/api/orgEntitlement/update-cms-entitlements`;
      const token = localStorageService.getItem('firebase-token');
      const headers = {
        authorization: token,
      };

      const payload = {
        orgId,
        isPricing: true,
        currencyCode: currency.value,
        ...(record || {}),
        mode,
        orgEntitlementItem: {
          ...(selectedItem || {}),
          crm_entitlements_id: record?.id,
        },
        pricingLabels: optionLabels,
      };

      axios
        .post(url, payload, { headers })
        .then((res) => {
          getData();
          addToast('Data saved successfully.', 'success');
          onCancel();
          cb?.();
        })
        .catch((e) => {
          addToast('Failed to save.', 'danger');
        });
    } catch (e) {
      addToast('Exception occurred... Kindly try again by reloading page.', 'danger');
    }
  };

  const onCancel = () => {
    setSelectedItem();
  };

  const onEdit = (id) => {
    const selectedItem = record?.orgEntitlementItems.find((l) => l.id === id);
    setSelectedItem(selectedItem);
  };

  const onOptionLabelChange = (k, v) => {
    setOptionLabels({ ...optionLabels, [k]: v });
  };

  const ITEMS = [
    {
      title: 'Option 1 label',
      key: 'pricingOption1Label',
      onChange: onOptionLabelChange,
      type: 'text',
    },
    {
      title: 'Strike #1',
      key: 'strike1',
      validate,
    },
    {
      title: 'Delta #1',
      key: 'delta1',
      validate,
    },
    {
      title: 'Counter Party #1',
      key: 'counterParty1',
      valueField: 'text',
      type: 'text',
      onChange: onCounterPartyChange,
    },
    {
      title: 'Option 2 label',
      key: 'pricingOption2Label',
      onChange: onOptionLabelChange,
      type: 'text',
    },
    {
      title: 'Strike #2',
      key: 'strike2',
      validate,
    },
    {
      title: 'Delta #2',
      key: 'delta2',
      validate,
    },
    {
      title: 'Counter Party #2',
      key: 'counterParty2',
      valueField: 'text',
      type: 'text',
      onChange: onCounterPartyChange,
    },
    {
      title: 'Option 3 label',
      key: 'pricingOption3Label',
      onChange: onOptionLabelChange,
      type: 'text',
    },
    {
      title: 'Strike #3',
      key: 'strike3',
      validate,
    },
    {
      title: 'Delta #3',
      key: 'delta3',
      validate,
    },
    {
      title: 'Counter Party #3',
      key: 'counterParty3',
      valueField: 'text',
      type: 'text',
      onChange: onCounterPartyChange,
    },
  ];

  return (
    <div className="mb-6 px-4">
      {ITEMS.map((item, i) => {
        const eItem = record?.orgEntitlementItems.find((l) => l.name === item.key);
        return (
          <EntitlementItem
            key={item.key}
            data={item}
            onChange={item.onChange || onChangeField}
            id={eItem?.id || item.key}
            onEdit={onEdit}
            value={eItem?.min || optionLabels[item.key] || eItem?.[item.valueField]}
            onCancel={onCancel}
            onSave={onSave}
          />
        );
      })}
    </div>
  );
};
