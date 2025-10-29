import React, { useEffect, useRef, useState, useMemo } from 'react';
import cn from 'classnames';
import { Icon, FlagIcon } from '@client/common';
import Select, { components } from 'react-select';
import { tradeCurrencies } from '../../utils/constants';

import { useToast, localStorageService } from '@client/common';
import axios from 'axios';
import { differenceWith, intersectionWith, orderBy, sortBy, uniqBy } from 'lodash';
const { Option } = components;

const months = [
  { value: 0, label: 'All' },
  { value: 1, label: '1 Month' },
  { value: 2, label: '2 Months' },
  { value: 3, label: '3 Months' },
  { value: 4, label: '4 Months' },
  { value: 5, label: '5 Months' },
  { value: 6, label: '6 Months' },
  { value: 7, label: '7 Months' },
  { value: 8, label: '8 Months' },
  { value: 9, label: '9 Months' },
  { value: 10, label: '10 Months' },
  { value: 11, label: '11 Months' },
  { value: 12, label: '12 Months' },
];

const BASE_CLASSES = ['flex'];
const verticalClass = ['items-center', 'justify-center', 'px-6', 'flex-col'];
const horizontalClass = ['items-center'];

const iconStyle = {
  width: '18px',
  height: '18px',
  cursor: 'pointer',
  marginLeft: '10px',
};

const IconOption = (props) => (
  <Option {...props}>
    <div className="w-full flex items-center" style={{ minWidth: '145px' }}>
      <FlagIcon currency={props.data.value} style={{ 'margin-right': '5px' }} />
      <span className="ml-2">{props.data.label}</span>
    </div>
  </Option>
);

const Control = ({ children, ...props }) => {
  const { selectProps } = props;

  return (
    <components.Control {...props} className="pl-2">
      <div className="w-full flex items-center justify-between" style={{ minWidth: '150px' }}>
        <div className="flex items-center">
          <FlagIcon currency={selectProps.value.value} />
          <span className="ml-2 flex">{selectProps.value.value}</span>
        </div>
        {children[1]}
      </div>
    </components.Control>
  );
};

export const CurrencyReserves = ({
  onChange,
  fetchingCurrencies,
  setFetchingCurrencies,
  selected,
  setData,
  horizontal = false,
  editable = false,
  organisation,
  className = '',
  fetchEntryCount = false,
  mode = null,
}) => {
  const { addToast } = useToast();
  const [list, setLists] = useState([]);
  const [record, setRecord] = useState();
  const [inEditMode, setInEditMode] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedItem, setSelectedItem] = useState();
  const [submitting, setSubmitting] = useState(false);
  const [availableCurrencies, setAvailableCurrencies] = useState();
  const firstInputRef = useRef(null);

  useEffect(() => {
    setSelectedMonth(0);
  }, [mode]);

  useEffect(() => {
    if (fetchingCurrencies) {
      getAvailableCurrencies();
    }
    if (!fetchingCurrencies) {
      getData();
    }
  }, [fetchingCurrencies, mode]);

  const memorizedCurrencyOptions = useMemo(() => {
    const { currencyHavingEntries, currencyHavingPlan } = availableCurrencies || { currencyHavingEntries: {}, currencyHavingPlan: [] };
    if (fetchEntryCount) {
      const currencyHavingBoth = intersectionWith(
        Object.keys(currencyHavingEntries),
        currencyHavingPlan.map((r) => r.currencyCode)
      );
      const currencyNotHavingBoth = differenceWith([...Object.keys(currencyHavingEntries), ...currencyHavingBoth], currencyHavingBoth);
      const sortedCurrencyhavingBoth = orderBy(currencyHavingBoth, (r) => r, 'asc');
      const sortedCurrencyNothavingBoth = orderBy(currencyNotHavingBoth, (r) => r, 'asc');
      const remainingCurrencies = differenceWith(tradeCurrencies, [...sortedCurrencyhavingBoth, ...sortedCurrencyNothavingBoth]);
      return [...sortedCurrencyhavingBoth, ...sortedCurrencyNothavingBoth, ...remainingCurrencies]
        // .filter((r) => r.toLowerCase() !== organisation?.currency?.toLowerCase())
        .map((c) => ({ label: c, value: c }));
    } else {
      const plannedCurrencies = currencyHavingPlan.map((r) => r.currencyCode);
      const currencyNotHavingBoth = differenceWith(tradeCurrencies, plannedCurrencies);
      const sortedCurrencyhavingBoth = orderBy(plannedCurrencies, (r) => r, 'asc');
      const sortedCurrencyNothavingBoth = orderBy(currencyNotHavingBoth, (r) => r, 'asc');
      const remainingCurrencies = differenceWith(tradeCurrencies, [...sortedCurrencyhavingBoth, ...sortedCurrencyNothavingBoth]);
      return [...sortedCurrencyhavingBoth, ...sortedCurrencyNothavingBoth, ...remainingCurrencies]
        // .filter((r) => r.toLowerCase() !== organisation?.currency?.toLowerCase())
        .map((c) => ({ label: c, value: c }));
    }
  }, [availableCurrencies, organisation, fetchEntryCount]);

  const openNotificationWithIcon = (type = 'success', title = '', description = 'Success', style = {}) => {
    addToast(description, type, 'fixed');
  };

  const getAvailableCurrencies = async () => {
    try {
      const url = '/api/cms/get-entitlement-currency';
      const token = localStorageService.getItem('firebase-token');
      const headers = {
        authorization: token,
      };
      axios
        .post(
          url,
          { orgId: organisation?.id, fetchEntryCount, mode },
          {
            headers: headers,
          }
        )
        .then((res) => {
          setAvailableCurrencies(res.data.data);
          setFetchingCurrencies(false);
        })
        .catch((e) => {
          console.log(e);
          setFetchingCurrencies(false);
          openNotificationWithIcon('danger', 'Error', 'Error in fetching currencies.');
        });
    } catch (e) {
      console.error(e);
      openNotificationWithIcon('danger', 'Error', 'Error in fetching currencies.');
      setFetchingCurrencies(false);
    }
  };

  const toggleEditMode = () => {
    if (!inEditMode) {
      const { orgEntitlementItems } = record || {};
      let item = orgEntitlementItems?.find((o) => parseInt(o.name, 10) === parseInt(selectedMonth.value, 10));
      if (!item) {
        item = {
          name: selectedMonth.value,
          min: 0,
          max: 0,
        };
      }
      setSelectedItem(item);
      setTimeout(() => firstInputRef.current.focus(), 0);
    }
    setInEditMode(!inEditMode);
  };
  const cancleEdit = () => {
    onSelectCurrency(selected);
    toggleEditMode();
  };

  const onSelectCurrency = (obj) => {
    const record = list.find((o) => o.currencyCode === obj.value);
    setRecord(record);
    onChange(obj);
  };

  const onChangeField = (k) => (e) => {
    if (selectedItem) {
      setSelectedItem({ ...selectedItem, [k]: e.target.value, name: selectedMonth.value });
    } else {
      const { orgEntitlementItems } = record || {};
      let item = orgEntitlementItems?.find((o) => parseInt(o.name, 10) === parseInt(selectedMonth.value, 10));
      if (item) {
        item[k] = e.target.value;
      } else {
        item = {
          name: selectedMonth.value,
          [k]: e.target.value,
        };
      }
      setSelectedItem(item);
    }
  };

  const getData = () => {
    try {
      let url = `/api/orgEntitlement/get-cms-entitlements`;
      const token = localStorageService.getItem('firebase-token');
      const headers = {
        authorization: token,
      };

      axios.post(url, { orgId: organisation?.id, mode }, { headers: headers }).then((res) => {
        const results = res.data.data.cmsEntitlements;
        setLists(results);
        if (!selected) {
          const record = results.find((o) => o.currencyCode === memorizedCurrencyOptions[0].value);
          setRecord(record);
          onChange(memorizedCurrencyOptions[0]);
        } else {
          const record = results.find((o) => o.currencyCode === selected.value);
          setRecord(record);
        }
        if (setData) {
          setData(results);
        }
      });
    } catch (e) {
      addToast('Exception occurred... Kindly try again by reloading page.', 'danger');
    }
  };

  const onUpdate = (e) => {
    try {
      setSubmitting(true);
      let url = `/api/orgEntitlement/update-cms-entitlements`;
      const token = localStorageService.getItem('firebase-token');
      const headers = {
        authorization: token,
      };

      const payload = {
        orgId: organisation?.id,
        currencyCode: selected.value,
        ...(record || {}),
        mode,
        orgEntitlementItem: {
          ...(selectedItem || {}),
          crm_entitlements_id: record?.id,
        },
      };

      axios
        .post(url, payload, { headers })
        .then((res) => {
          getData();
          addToast('Data saved successfully.', 'success');
          setInEditMode(false);
          setSubmitting(false);
          setSelectedItem('');
        })
        .catch((e) => {
          setSubmitting(false);
          addToast('Failed to save.', 'danger');
          setSelectedItem('');
        });
    } catch (e) {
      addToast('Exception occurred... Kindly try again by reloading page.', 'danger');
    }
  };

  const enabledToSave = Object.values(selectedItem || {}).some((v) => !!v);

  const records = useMemo(() => {
    if (editable) {
      if (selectedMonth?.value) {
        const item = record?.orgEntitlementItems?.find((o) => parseInt(o.name, 10) === parseInt(selectedMonth.value, 10));
        return item ? [item] : [{ name: selectedMonth.value }];
      }
    }
    return orderBy(record?.orgEntitlementItems || [], (r) => parseInt(r.name, 10), 'asc');
  }, [selectedMonth, record]);

  return (
    <div className={cn(BASE_CLASSES, className, horizontal ? horizontalClass : verticalClass)}>
      <div className="flex">
        <Select
          defaultValue={memorizedCurrencyOptions[0]}
          options={memorizedCurrencyOptions}
          components={{ Option: IconOption, Control }}
          onChange={onSelectCurrency}
          value={selected}
          isDisabled={inEditMode || submitting}
          // menuPlacement="auto"
          isLoading={fetchingCurrencies}
        />
        {editable && !fetchingCurrencies && (
          <Select
            defaultValue={months[0]}
            options={months}
            onChange={setSelectedMonth}
            value={selectedMonth}
            isDisabled={inEditMode || submitting}
            closeMenuOnSelect
            placeholder="Select month"
            className="ml-2 w-40"
            // menuPlacement="auto"
          />
        )}
      </div>
      {!!records.length && !fetchingCurrencies && (
        <table className={`border-solid border-t border-l border-gray-500 my-8 ${horizontal ? 'ml-8' : ''}`}>
          <thead>
            <tr className="border-solid border-b border-gray-500">
              <td className="border-solid border-r px-4 py-1 font-medium border-gray-500"></td>
              {records.map((o) => {
                return (
                  <td key={o.id} className="border-solid border-r px-3 py-1 font-medium border-gray-500">
                    {o.name} {o.name > 1 ? 'Months' : 'Month'}
                  </td>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <tr className="border-solid border-b border-gray-500">
              <td className="border-solid border-r px-4 py-1 font-medium border-gray-500">MAX</td>
              {records.map((o, i) => {
                return (
                  <td key={o.id} className="border-solid text-center border-r border-gray-500" style={{ color: 'rgb(198 131 25)' }}>
                    {inEditMode ? (
                      <input
                        min="0"
                        max="100"
                        type="number"
                        onChange={onChangeField('max')}
                        value={selectedItem ? Number(selectedItem.max).toFixed(2) : ''}
                        className="py-1 px-2 border"
                        style={{ maxWidth: '93px', textAlign: 'center' }}
                        {...(i === 0 ? { ref: firstInputRef } : {})}
                      />
                    ) : (
                      `${Number(o?.max || 0).toFixed(2)}%`
                    )}
                  </td>
                );
              })}
            </tr>
            <tr className="border-solid border-b border-gray-500">
              <td className="border-solid border-r px-4 py-1 font-medium border-gray-500">MIN</td>
              {records.map((o, i) => {
                return (
                  <td key={o.id} className="border-solid text-center border-r border-gray-500" style={{ color: 'rgb(198 131 25)' }}>
                    {inEditMode ? (
                      <input
                        max="100"
                        min="0"
                        type="number"
                        onChange={onChangeField('min')}
                        value={selectedItem ? Number(selectedItem.min).toFixed(2) : ''}
                        className="py-1 px-2 border"
                        style={{ maxWidth: '93px', textAlign: 'center' }}
                      />
                    ) : (
                      `${Number(o?.min || 0).toFixed(2)}%`
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      )}
      <div className="flex items-center">
        {editable && !inEditMode && records.length > 0 && !!selectedMonth?.value && <Icon icon="edit" onClick={toggleEditMode} style={iconStyle} />}
        {inEditMode && (
          <>
            <button onClick={onUpdate} disabled={submitting}>
              <Icon icon="tick-circle-filled" style={{ ...iconStyle, color: enabledToSave && !submitting ? 'green' : 'gray' }} />
            </button>
            <button onClick={cancleEdit}>
              <Icon icon="close" style={{ ...iconStyle, color: 'red' }} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
