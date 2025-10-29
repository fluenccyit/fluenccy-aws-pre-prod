import React, { memo, useContext, useEffect, useState } from 'react';
import { action } from '@storybook/addon-actions';
import { Icon, Text, Select } from '@client/common';
import internal from 'stream';
import UploadCSVContext from '@client/upload-csv/pages/upload-csv-context';
import { useLocation } from 'react-router';
import { CURRENY_MANAGEMENT_ROUTES } from '@client/currency-management';

type Props = {
  columnName: string;
  index: number;
  selectedVal: string;
};

const HEDGING_OPTIONS = [
  { label: ' Select Column ', value: '' },
  { label: 'Amount Due', value: 'amountDue' },
  { label: 'Contact Name*', value: 'contactName' },
  { label: 'Credited Amount', value: 'amountCredited' },
  { label: 'Currency Code*', value: 'currencyCode' },
  { label: 'Invoice Amount*', value: 'total' },
  { label: 'Invoice Currency Rate*', value: 'currencyRate' }, // invoice table
  { label: 'Invoice Date*', value: 'date' },
  { label: 'Invoice Due Date*', value: 'dateDue' },
  { label: 'Invoice ID*', value: 'invoiceNumber' },
];

const HEDGING_WITH_RECEIVABLE_OPTIONS = [...HEDGING_OPTIONS, { label: 'Home Currency Code*', value: 'homeCurrencyCode' }];

const OPTIONS = [
  { label: ' Select Column ', value: '' },
  { label: 'Amount Due', value: 'amountDue' },
  { label: 'Contact Name*', value: 'contactName' },
  { label: 'Credited Amount', value: 'amountCredited' },
  { label: 'Currency Code*', value: 'currencyCode' },
  { label: 'Invoice Amount*', value: 'total' },
  { label: 'Invoice Currency Rate*', value: 'currencyRate' }, // invoice table
  { label: 'Invoice Date*', value: 'date' },
  { label: 'Invoice Due Date', value: 'dateDue' },
  { label: 'Invoice ID', value: 'invoiceNumber' },
  { label: 'Paid Amount*', value: 'amountPaid' },
  { label: 'Payment Currency Rate*', value: 'paymentCurrencyRate' }, // payment table
  { label: 'Payment Date*', value: 'paymentDate' },
];

const RECEIVABLE_OPTIONS = [
  { label: ' Select Column ', value: '' },
  // { label: 'Amount Due', value: 'amountDue' },
  { label: 'Contact Name*', value: 'contactName' },
  // { label: 'Credited Amount', value: 'amountCredited' },
  { label: 'Currency Code*', value: 'currencyCode' },
  { label: 'Invoice Amount*', value: 'total' },
  { label: 'Invoice Currency Rate*', value: 'currencyRate' }, // invoice table
  { label: 'Invoice Date*', value: 'date' },
  // { label: 'Invoice Due Date', value: 'dateDue' },
  { label: 'Invoice ID', value: 'invoiceNumber' },
  { label: 'Received Amount*', value: 'amountPaid' },
  { label: 'Received Currency Rate*', value: 'paymentCurrencyRate' }, // payment table
  { label: 'Received Date*', value: 'paymentDate' },
  { label: 'Home Currency Code*', value: 'homeCurrencyCode' },
];

const CURRENCY_MANAGEMENT_OPTIONS = [
  { label: ' Select Column ', value: '' },
  { label: 'Amount*', value: 'amount' },
  { label: 'Budget Rate*', value: 'budgetRate' },
  { label: 'Foreign Currency Code*', value: 'foreignCurrencyCode' },
  { label: 'Payment Month*', value: 'paymentMonth' },
  { label: 'Payment Year*', value: 'paymentYear' },
];

export const CSVColumn = memo(({ columnName, index, selectedVal, mode }: Props) => {
  const { updateColumnMappingData, columnMappingData } = useContext(UploadCSVContext);

  const location = useLocation();

  const [selected, setSelected] = useState(undefined);
  const isHedging = location.pathname.includes('/plan');
  const isCurrencyManagement = location.pathname.includes('/currency-management');

  useEffect(() => {
    setSelected(selectedVal);
  }, []);
  const options =
    isHedging && mode === 'receivables'
      ? HEDGING_WITH_RECEIVABLE_OPTIONS
      : isHedging
      ? HEDGING_OPTIONS
      : isCurrencyManagement
      ? CURRENCY_MANAGEMENT_OPTIONS
      : mode === 'receivables'
      ? RECEIVABLE_OPTIONS
      : OPTIONS;

  const handleChange = (value: string) => {
    let matchedObj = options.filter((obj) => obj.value == value);
    setSelected(matchedObj[0].value);
    // console.log('finaldata is =======>', columnMappingData);
    // if (columnMappingData && columnMappingData.length > 0) {
    //   updateColumnMappingData(...columnMappingData, { [`${columnName}`]: matchedObj[0].label });
    // } else {
    if (matchedObj[0].value !== '') {
      let obj = { [`${columnName}`]: `${matchedObj[0].value}` };
      updateColumnMappingData(obj);
    }
    // }
    // console.log('finaldata is =======>', obj);

    // action(value);
  };

  return (
    <div className="flex justify-between mt-2">
      <Text isBlock className="text-sm flex items-start break-words items-center" style={{ alignItems: 'center' }}>
        <p className="p-4 break-words">{columnName}</p>
      </Text>
      <div className=" items-end lg:inline-flex">
        <Select
          options={options}
          onChange={location.pathname.includes('edit') ? handleChange : null}
          value={selected ? selected : selectedVal}
          isDisabled={location.pathname.includes('edit') ? false : true}
          // isEditing={true}
        />
      </div>
    </div>
  );
});
