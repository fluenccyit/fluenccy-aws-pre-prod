import React, { memo, useState } from 'react';
import { useHistory } from 'react-router';
import { UPLOAD_CSV_ROUTES } from '..';
import axios from 'axios';
import { localStorageService } from '@client/common';
import { queryOrganisationsByToken, useQueryLocalOrganisation } from '@client/organisation';

const PlanUploadCSVContext = React.createContext('');

const PlanUploadCSVProvider = memo(function UploadCSVProvider(props) {
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [logId, setLogId] = useState('');
    const [logs, setLogs] = useState([]);
    const [spreadsheetData, setSpreadsheetData] = useState(undefined);
    const [columnMappingData, setColumnMappingData] = useState({});
    const [recentUploadFileData, setRecentUploadFileData] = useState(undefined);
    const [recentUploadFile, setRecentUploadFile] = useState(undefined);
    const [fileUploadProgress, setFileUploadProgress] = useState(0);
    const history = useHistory();
    const { organisation } = useQueryLocalOrganisation();

    const getLogsData = async () => {
        const data = new FormData();
        //  data.append('file', file);
        //  console.warn(file);
        let url = `/api/import/logs`;
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
                    tenantId: tenantId,
                    orgId: orgId,
                },
                {
                    headers: headers,
                }
            )
            .then((res) => {
                // then print response status
                console.warn(res.data.data);
                // alert('api got success');
                setLogs(res.data.data);
            });
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

    const sendUploadFile = async (file: any) => {
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
        data.append('tenantId', tenantId);
        data.append('orgId', orgId);

        const config = {
            onUploadProgress: function (progressEvent) {
                var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setFileUploadProgress(percentCompleted);
                console.log(percentCompleted);
            },
        };

        axios
            .post(url, data, {
                headers: headers,
                onUploadProgress: function (progressEvent) {
                    var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setFileUploadProgress(percentCompleted);
                    console.log(percentCompleted);
                },
            })
            .then((res) => {
                // then print response status
                console.warn(res);
            });
    };
    const sendUploadFileData = (fileData: any) => {
        setRecentUploadFileData(fileData);

    };

    return (
        <PlanUploadCSVContext.Provider
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
            }}
        >
            {props.children}
        </PlanUploadCSVContext.Provider>
    );
});

export { PlanUploadCSVProvider };
export default PlanUploadCSVContext;
