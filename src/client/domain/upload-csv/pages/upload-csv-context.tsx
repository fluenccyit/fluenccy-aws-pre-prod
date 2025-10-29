import React, { memo, useState } from 'react';
import { useHistory } from 'react-router';
import { orderBy, filter } from 'lodash';
import { UPLOAD_CSV_ROUTES } from '..';
import axios from 'axios';
import { localStorageService, useToast } from '@client/common';
import { queryOrganisationsByToken, useQueryLocalOrganisation } from '@client/organisation';

const UploadCSVContext = React.createContext('');

const UploadCSVProvider = memo(function UploadCSVProvider(props) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [logId, setLogId] = useState('');
  const [logs, setLogs] = useState([]);
  const [spreadsheetData, setSpreadsheetData] = useState(undefined);
  const [columnMappingData, setColumnMappingData] = useState({});
  const [recentUploadFileData, setRecentUploadFileData] = useState(undefined);
  const [recentUploadFile, setRecentUploadFile] = useState(undefined);
  const [fileUploadProgress, setFileUploadProgress] = useState(0);
  const { addToast } = useToast();
  const { organisation } = useQueryLocalOrganisation();
  const [order, setOrder] = useState([
    { colName: 'created_at', orderBy: 'asc' },
    { colName: 'filename', orderBy: 'asc' },
    { colName: 'fileType', orderBy: 'asc' },
    { colName: 'review_status', orderBy: 'asc' },
  ]);

  const history = useHistory();
  const DOMAIN = process.env.DOMAIN;
  const isInCMS = history.location.pathname == '/currency-management' ? true : false;

  const getLogsData = async (params = {}) => {
    const data = new FormData();
    //  data.append('file', file);
    //  console.warn(file);
    let url = `/api/import/logs`;
    console.log('===========>', url);
    const token = localStorageService.getItem('firebase-token');
    const headers = {
      authorization: token,
    };

    const orgId = organisation?.id;
    const tenantId = organisation?.tenant.id;
    let res = await axios.post(
      url,
      {
        tenantId: tenantId,
        orgId: orgId,
        isInCMS,
        ...params,
      },
      {
        headers: headers,
      }
    );

    setLogs(res.data.data);
    return res.data.data;
  };
  const updateSpreadSheetData = (spreadsheetData: any) => {
    setSpreadsheetData(spreadsheetData);
  };
  const updateColumnMappingData = (data: any) => {
    // setColumnMappingData(...columnMappingData, ...data);
    Object.assign(columnMappingData, data);
    setColumnMappingData(columnMappingData);
    console.log('columnMappingData----', columnMappingData);
  };
  const updateLogId = (data: string) => {
    setLogId(data);
  };

  const sendUploadFile = async (file: any, extra = {}) => {
    // if (!file.type.toLowerCase().includes('csv')) {
    if (!file.type.toLowerCase().includes('csv') && !file.type.toLowerCase().includes('application/vnd.ms-excel')) {
      addToast('Please select/upload CSV file.', 'danger');
      console.log('invalid file format');
      return;
    }
    setRecentUploadFile(file);

    const data = new FormData();
    data.append('file', file);
    console.warn('file ', file);
    let url = `/api/import/file`;
    const token = localStorageService.getItem('firebase-token');
    const headers = {
      authorization: token,
    };

    const orgId = organisation?.id;
    const tenantId = organisation?.tenant.id;
    const isHedging = history.location.pathname == '/plan' ? true : false;
    data.append('tenantId', tenantId);
    data.append('orgId', orgId);
    data.append('isHedging', isHedging || !!extra.isHedging);
    data.append('isInCMS', isInCMS || !!extra.isInCMS);
    if (extra.mode) {
      data.append('mode', extra?.mode);
    }

    const config = {
      onUploadProgress: function (progressEvent) {
        var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setFileUploadProgress(percentCompleted);
        console.log('per', percentCompleted);
      },
    };

    axios
      .post(url, data, {
        headers: headers,
        ...config,
      })
      .then((res) => {
        // then print response status
        console.log('in done');

        if (res.data.status !== 'FAILURE') {
          console.log(`${file.path} File uploaded successfully`);
          if (extra.onSuccess) {
            extra.onSuccess();
          } else {
            addToast('File uploaded successfully.', 'success');
            getLogsData({ isHedging, mode: extra.mode });
          }
        } else {
          addToast('Unable to upload file due to reason: ' + res.data.message, 'danger');
        }
      });
  };
  const sendUploadFileData = (fileData: any) => {
    setRecentUploadFileData(fileData);
  };

  // const onSort = (filename: string) => {
  //   const sortedRecords = orderBy(logs, [filename])
  //   setLogs(sortedRecords)
  // }

  const onSort = (colName: string) => {
    const filteredCol = filter(order, { colName: colName });

    const sortedRecords = orderBy(logs, [colName], [filteredCol.length > 0 ? filteredCol[0].orderBy : 'asc']);
    setLogs(sortedRecords);
    if (filteredCol.length > 0) {
      filteredCol[0].orderBy = filteredCol[0].orderBy === 'asc' ? 'desc' : 'asc';

      const newOrder = [
        {
          colName: filteredCol[3].colName,
          orderBy: filteredCol[3].orderBy,
        },
      ];
      setOrder(newOrder);
    }
  };

  return (
    <UploadCSVContext.Provider
      value={{
        recentUploadFileData,
        recentUploadFile,
        sendUploadFile,
        sendUploadFileData,
        spreadsheetData,
        updateSpreadSheetData,
        columnMappingData,
        updateColumnMappingData,
        logId,
        updateLogId,
        getLogsData,
        logs,
        fileUploadProgress,
        onSort,
      }}
    >
      {props.children}
    </UploadCSVContext.Provider>
  );
});

export { UploadCSVProvider };
export default UploadCSVContext;
