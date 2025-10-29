import React, { memo, useEffect, useState } from 'react';
import { filter, map } from 'lodash';
import { useHistory } from 'react-router-dom';
import { AUTH_ROUTES } from '@client/auth';
import { queryPayments } from '@client/payment';
import { sharedDateTimeService } from '@shared/common';
import { useQueryLocalChart } from '@client/chart';
import { useQueryLocalOrganisation } from '@client/organisation';
import { APOLLO_ERROR_MESSAGE, uiVar, Text } from '@client/common';
import { PaymentDetails, sharedPaymentService } from '@shared/payment';
import { UploadDataLogs } from '@shared/upload-csv';

import { queryUploadCSV, UploadCSVDetailsCSVSkeleton, UploadCSVTableHeaderCell, UploadCSVTableRow } from '@client/upload-csv';

export const UploadCSVDetailsCSV = memo(() => {
  const history = useHistory();
  const { organisation } = useQueryLocalOrganisation();
  const { chartDateRange, chartCurrency } = useQueryLocalChart();
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState<PaymentDetails[]>([]);
  const [logs, setLogs] = useState<UploadDataLogs[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        let uploadDataLogs: UploadDataLogs[] = [];
        uploadDataLogs.push({
          uploadId: '1',
          uploadDate: '02/10/2021',
          fileType: 'CSV',
          currentStatus: 'Uploaded',
        });

        uploadDataLogs.push({
          uploadId: '2',
          uploadDate: '03/10/2021',
          fileType: 'PDF',
          currentStatus: 'Uploaded',
        });

        uploadDataLogs.push({
          uploadId: '3',
          uploadDate: '04/10/2021',
          fileType: 'CSV',
          currentStatus: 'Uploaded',
        });
        console.log('uploadDataLogs  length >>>> ', uploadDataLogs.length);
        setLogs(uploadDataLogs);

        setIsLoading(false);
        uiVar('ready');
      } catch ({ message }) {
        if (message === APOLLO_ERROR_MESSAGE.authenticationFailed) {
          history.push(AUTH_ROUTES.login);
        } else {
          setIsError(true);
          setIsLoading(false);
        }
      }
    })();
  }, [organisation, chartCurrency, chartDateRange]);

  // If no date range is selected the green "select a month" dialog will prompt user to select a month from the chart In that case, don't show the
  // table at all.
  // if (!chartDateRange) {
  //   return null;
  // }

  // if (isLoading) {
  //   return <UploadCSVDetailsCSVSkeleton />;
  // }

  if (!logs.length) {
    return null;
  }

  // @TODO: Need designs for Invoice Table error state
  if (isError) {
    return (
      <div className="h-32 w-full flex items-center justify-center">
        <Text className="text-lg" variant="gray">
          Oh no! Looks like something went wrong when loading that month of invoices...
        </Text>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col mt-6" data-testid="flnc-invoice-table">
      <div className="w-full align-middle inline-block min-w-full">
        <div className="w-full shadow border-b border-gray-200 sm:rounded-lg overflow-hidden">
          <div id="spreadsheet"></div>
        </div>
      </div>
    </div>
  );
});
