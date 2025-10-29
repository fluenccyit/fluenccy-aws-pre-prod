import React, { memo, useEffect, useState, useContext } from 'react';
import { filter, map, orderBy } from 'lodash';
import { useHistory } from 'react-router-dom';
import { AUTH_ROUTES } from '@client/auth';
import { queryPayments } from '@client/payment';
import { sharedDateTimeService } from '@shared/common';
import { useQueryLocalChart } from '@client/chart';
import { useQueryLocalOrganisation, queryOrganisationsByToken } from '@client/organisation';
import { APOLLO_ERROR_MESSAGE, uiVar, Text, localStorageService, useToast } from '@client/common';
import { PaymentDetails, sharedPaymentService } from '@shared/payment';
import { UploadDataLogs } from '@shared/upload-csv';

import { queryUploadCSV, UploadCSVTableSkeleton, UploadCSVTableHeaderCell, UploadCSVTableRow, UploadCSVTableCell } from '@client/upload-csv';
import UploadCSVContext from '@client/upload-csv/pages/upload-csv-context';
import axios from 'axios';

export const UploadCSVTable = memo(({ mode }) => {
  const history = useHistory();
  const { organisation } = useQueryLocalOrganisation();
  const { chartDateRange, chartCurrency } = useQueryLocalChart();
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState<PaymentDetails[]>([]);
  const [refreshData, setRefreshData] = useState(false);
  const { addToast } = useToast();
  const isInCMS = history.location.pathname == '/currency-management' ? true : false;

  const { logs, recentUploadFileData, recentUploadFile, getLogsData, onSort } = useContext(UploadCSVContext);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);

        const isHedging = history.location.pathname == '/plan' ? true : false;
        getLogsData({ isHedging, mode: mode || null });
        setRefreshData(true);
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
  }, [organisation, chartCurrency, chartDateRange, recentUploadFileData, recentUploadFile, mode]);

  const onDeleteFile = (log) => {
    const isHedging = history.location.pathname.includes('/plan') ? true : false;
    try {
      const confirmBox = window.confirm(`Do you really want to delete the file ${log.filename}?`);
      if (confirmBox === false) {
        return;
      }

      let url = `/api/import/delete-csv`;
      const token = localStorageService.getItem('firebase-token');
      const headers = {
        authorization: token,
      };

      const orgId = organisation?.id;
      const tenantId = organisation?.tenant.id;

      axios
        .post(
          url,
          {
            tenantId,
            orgId,
            logId: log.id,
            isHedging,
            isInCMS,
            mode,
          },
          {
            headers: headers,
          }
        )
        .then((res) => {
          getLogsData({ isHedging, mode: mode || null });
          addToast(`File ${log.filename} successfully deleted`);
        });
    } catch ({ message }) {
      if (message === APOLLO_ERROR_MESSAGE.authenticationFailed) {
        history.push(AUTH_ROUTES.login);
      } else {
        addToast(message, 'danger');
      }
    }
  };

  if (isLoading) {
    return <UploadCSVTableSkeleton />;
  }

  if (!logs || !logs.length) {
    return <p style={{ fontSize: '18px', color: 'grey', marginTop: '20px' }}>Logs not found. Please import CSV file to view logs.</p>;
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
          <table className="w-full divide-y divide-gray-200 border-collapse font-medium">
            <thead className="bg-gray-50">
              <tr>
                <UploadCSVTableHeaderCell>#</UploadCSVTableHeaderCell>
                <UploadCSVTableHeaderCell>
                  <button className="text-xs font-medium uppercase" onClick={() => onSort('created_at')}>
                    Upload Date ▲
                  </button>
                </UploadCSVTableHeaderCell>
                <UploadCSVTableHeaderCell>
                  <button className="text-xs font-medium uppercase" onClick={() => onSort('filename')}>
                    File Name ▲
                  </button>
                </UploadCSVTableHeaderCell>
                <UploadCSVTableHeaderCell>
                  <button className="text-xs font-medium uppercase" onClick={() => onSort('fileType')}>
                    File Type ▲
                  </button>
                </UploadCSVTableHeaderCell>
                <UploadCSVTableHeaderCell>
                  <button className="text-xs font-medium uppercase" onClick={() => onSort('review_status')}>
                    Status ▲
                  </button>
                </UploadCSVTableHeaderCell>
                <UploadCSVTableHeaderCell>Actions</UploadCSVTableHeaderCell>
              </tr>
            </thead>
            <tbody>
              {refreshData &&
                map(logs, (uploadLogs, index) => (
                  <UploadCSVTableRow onDelete={onDeleteFile} uploadLogs={uploadLogs} key={uploadLogs.id} index={`${index + 1}`} />
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});
