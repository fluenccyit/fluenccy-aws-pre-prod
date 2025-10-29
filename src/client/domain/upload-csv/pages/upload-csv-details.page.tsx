import React, { memo, useContext, useEffect, useState } from 'react';
import { last } from 'lodash';
import { useHistory } from 'react-router-dom';
import { AUTH_ROUTES } from '@client/auth';
import { AppErrorPage } from '@client/app';
import { GqlCurrencyScoreBreakdown } from '@graphql';
import { ONBOARDING_ROUTES } from '@client/onboarding';
import { APOLLO_ERROR_MESSAGE, localStorageService, loggerService, Page, uiVar, useAnalytics, useQueryLocalCommon } from '@client/common';
import { useQueryLocalOrganisation } from '@client/organisation';
import {
  UploadCSVDetailsBreakdown,
  UploadCSVDetailsCSVSkeleton,
  UploadCSVPageContent,
  UploadCSVTable,
  UploadCSVTableContainer,
} from '@client/upload-csv';
import axios from 'axios';
import { useParams } from 'react-router';
import UploadCSVContext, { UploadCSVProvider } from './upload-csv-context';
import { encryption, FIELDS_TO_ENCRYPT_DECRYPT } from '@shared/common';

export const UploadCSVDetailsPage = memo(({ isInCMS = false }) => {
  const history = useHistory();
  const { track } = useAnalytics();
  const params = useParams();
  const { ui } = useQueryLocalCommon();
  const { organisation } = useQueryLocalOrganisation();
  const [breakdown, setBreakdown] = useState<GqlCurrencyScoreBreakdown>();
  const [currencyScores, setCurrencyScores] = useState<GqlCurrencyScoreBreakdown[]>([]);
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [fileName, setFilename] = useState();
  const [reviewStatus, setReviewStatus] = useState();
  const { updateSpreadSheetData, updateColumnMappingData } = useContext(UploadCSVContext);
  const [mode, setMode] = useState();

  useEffect(() => {
    track('currencyscore_viewed');
  }, []);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    // const data = new FormData();
    const data = { logId: params.id, isInCMS };
    const token = localStorageService.getItem('firebase-token');
    const headers = {
      authorization: token,
    };

    let url = `/api/import/contents`;

    let finalData = await axios.post(url, data, { headers: headers });
    let keys = finalData.data.data[0].content[0];
    let fieldColumnData = finalData.data.data[0].field_mapping;
    const dataArray = encryption.getDecryptedDataByColumns(finalData.data.data[0].content, fieldColumnData, FIELDS_TO_ENCRYPT_DECRYPT);
    console.log('dataArray', dataArray);
    let objKeys = Object.keys(keys);

    const newDataArray = await dataArray
      .filter(function (item: { [x: string]: string }) {
        var flag = false;
        var i = 0;

        flag = false;
        for (i = 0; i < objKeys.length; i++) {
          if (item[objKeys[i]] != '') {
            flag = true;
            break;
          }
        }

        if (flag == false) {
          return false;
        }

        return true;
      })
      .map((item) => {
        let object = [];
        Object.entries(item).forEach(([key, value]) => {
          const newObj = { value: `${value}` };
          object.push(newObj);
        });
        return object;
      });

    setColumns(Object.keys(keys));
    setFilename(finalData.data.data[0].filename);
    setReviewStatus(finalData.data.data[0].review_status);
    console.log('filename', finalData.data.data[0].filename);
    setData(newDataArray);
    updateColumnMappingData(fieldColumnData);
    updateSpreadSheetData(dataArray);
    setMode(finalData.data.data[0].mode);
  };

  useEffect(() => {
    (async () => {
      try {
        uiVar('loading');

        if (!organisation) {
          return;
        }

        if (!organisation.onboardingComplete) {
          loggerService.debug('[<CurrencyScorePage />] Organisation has not completed onboarding. Redirecting to onboarding.');
          return history.push(ONBOARDING_ROUTES.currencyScoreSummary);
        }

        setBreakdown(last(organisation.currencyScores));
        setCurrencyScores(organisation.currencyScores);
        uiVar('ready');
      } catch (error) {
        // if (error.message === APOLLO_ERROR_MESSAGE.authenticationFailed) {
        //   history.push(AUTH_ROUTES.login);
        // } else {
        //   loggerService.error(error);
        //   uiVar('error');
        // }
      }
    })();
  }, [organisation]);

  if (ui === 'loading') {
    return null;
  }

  if (ui === 'error' || !organisation) {
    return <AppErrorPage />;
  }
  const updateSpreadSheetDataFromChild = (data) => {
    updateSpreadSheetData(data);
  };

  const afterSave = () => getData();

  return (
    <Page>
      {/* <UploadCSVProvider> */}
      <UploadCSVPageContent>
        <div className="p-6 pb-2 md:pb-6 lg:bg-gray-100 lg:border-r lg:border-gray-200 lg:p-0">
          <UploadCSVDetailsBreakdown breakdown={breakdown} columns={columns} fileName={fileName} reviewStatus={reviewStatus} mode={mode} />
        </div>
        <div className="p-6 pb-10 flex flex-col bg-white overflow-x-hidden w-full">
          <UploadCSVDetailsCSVSkeleton
            columns={columns}
            data={data}
            logId={params.id}
            afterSave={afterSave}
            updateSpreadSheetData={updateSpreadSheetDataFromChild}
            mode={mode}
          />
        </div>
      </UploadCSVPageContent>
      {/* </UploadCSVProvider> */}
    </Page>
  );
});
