import { uiVar, Button, loggerService, useToast, useQueryLocalCommon, localStorageService, Input, FlagIcon } from '@client/common';
import React, { useState } from 'react';
import axios from 'axios';
import { useQueryLocalOrganisation } from '@client/organisation';
import moment from 'moment';

type Props = {
  type: string;
  invoice: object;
  cb: Function;
  invoiceId: string;
};

export const ScheduleForm = ({ invoiceId, type = '', invoice = {}, cb, onClose }: Props) => {
  const { buyingSchedule = {} } = invoice;
  const valueField = `executed${type}Value`;
  const dateField = `executed${type}Date`;
  const rateField = `executed${type}Rate`;
  console.log(buyingSchedule, buyingSchedule[`${type.toLowerCase()}Value`], buyingSchedule[valueField]);
  const getIntitalData = () => {
    return {
      [valueField]: buyingSchedule[valueField] || (buyingSchedule.isHedgedEverything ? invoice.total : buyingSchedule[`${type.toLowerCase()}Value`]),
      [dateField]: buyingSchedule[dateField],
      [rateField]: buyingSchedule[rateField] || (buyingSchedule.isHedgedEverything ? buyingSchedule.optimizedRate : 0),
    };
  };
  const [executedData, setExecutedData] = useState(getIntitalData());
  const { addToast } = useToast();
  const { ui } = useQueryLocalCommon();
  const { organisation } = useQueryLocalOrganisation();

  const onChange = (field, v) => {
    setExecutedData((prev) => ({ ...prev, [field]: v }));
  };

  const updateSchedule = async () => {
    try {
      // uiVar('saving');
      const payload = {
        orgId: organisation?.id,
        tenantId: organisation?.tenant.id,
        invoiceId,
      };
      if (executedData[valueField]) {
        payload[valueField] = executedData[valueField];
      }
      if (executedData[dateField]) {
        payload[dateField] = executedData[dateField];
      }
      if (executedData[rateField]) {
        payload[rateField] = executedData[rateField];
      }
      let url = `/api/hedge/update-buying-schedule`;
      const token = localStorageService.getItem('firebase-token');
      const headers = {
        authorization: token,
      };

      await axios.post(url, payload, { headers: headers });
      if (cb) {
        cb(invoiceId);
      }
      if (onClose) {
        onClose(false);
      }
      // uiVar('ready');
      addToast('Schedule updated.');
    } catch (error) {
      loggerService.error(error);
      addToast("Couldn't updated.", 'danger');
      // uiVar('ready');
    }
  };

  const noFieldsEmpty = executedData[valueField] && executedData[rateField] && executedData[dateField];

  return (
    <div className="flex">
      <div className="flex flex-col align-center w-full px-4">
        <div className="w-full p-4">
          <div className="flex w-full flex-col justify-around mb-2">
            <div className="flex py-4 justify-between items-center">
              <span style={{ minWidth: '45px' }}>Rate*</span>
              <Input type="number" value={executedData[rateField]} onChange={(e) => onChange(rateField, e.target.value)} className="ml-5" />
            </div>
            <div className="flex py-4 justify-between items-center">
              <span
                style={{
                  minWidth: '45px',
                  display: 'flex',
                  alignItems: 'center',
                  marginRight: '5px',
                }}
              >
                Value*
              </span>
              <FlagIcon currency={invoice.currencyCode} style={{ width: '20px' }} />
              <Input type="number" value={executedData[valueField]} onChange={(e) => onChange(valueField, e.target.value)} className="ml-5" />
            </div>
            <div className="flex py-4 justify-between items-center">
              <span style={{ minWidth: '45px' }}>Date*</span>
              <Input
                value={executedData[dateField]}
                onChange={(e) => onChange(dateField, e.target.value)}
                type="date"
                max={moment().format('YYYY-MM-DD')}
                className="right ml-5"
              />
            </div>
          </div>
        </div>
        <div className="flex mb-8 ml-4">
          <Button onClick={updateSchedule} variant="success" className="rounded-full font-bold" isDisabled={ui === 'saving' || !noFieldsEmpty}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};
