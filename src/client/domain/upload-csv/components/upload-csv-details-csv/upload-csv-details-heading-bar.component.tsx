import React, { memo, useContext, useState } from 'react';
import cn from 'classnames';
import { Text, Button } from '@client/common';
import { UPLOAD_CSV_ROUTES } from '@client/upload-csv';
import { useHistory, useLocation } from 'react-router';
import axios from 'axios';
import UploadCSVContext from '@client/upload-csv/pages/upload-csv-context';
import { localStorageService, useToast } from '@client/common';
import { useQueryLocalOrganisation } from '@client/organisation';
import { PLAN_ROUTES } from '@client/plan';
import { useParams } from 'react-router';
import { encryption, FIELDS_TO_ENCRYPT_DECRYPT } from '@shared/common';
import { CURRENY_MANAGEMENT_ROUTES } from '@client/currency-management';

export const UploadCSVDetailsHeadingBar = memo(({ cbOnSave, mode }) => {
  const history = useHistory();
  const params = useParams();
  const location = useLocation();
  const { addToast } = useToast();
  const [formError, setFormError] = useState('');
  const { spreadsheetData, logId, columnMappingData } = useContext(UploadCSVContext);
  const isHedging = history.location.pathname.includes('/plan');
  const isInCMS = history.location.pathname.includes('/currency-management');
  const { organisation } = useQueryLocalOrganisation();

  const onSaveButtonTapped = async (isPublished: Boolean) => {
    setFormError('');
    const token = localStorageService.getItem('firebase-token');
    const headers = {
      authorization: token,
    };
    // debugger;
    const orgId = organisation?.id;
    const tenantId = organisation?.tenant.id;
    let data = {
      content: encryption.getEncryptedDataByColumns(spreadsheetData, columnMappingData, FIELDS_TO_ENCRYPT_DECRYPT),
      logId: params.id,
      field_mapping: columnMappingData,
      is_published: isPublished,
      tenantId: tenantId,
      orgId: orgId,
      isHedging,
      isInCMS,
      mode,
    };

    console.log('final data is', data, columnMappingData);

    let url = `/api/import/update-contents`;
    axios
      .post(url, data, {
        headers: headers,
      })
      .then((res) => {
        // then print response status
        console.log('reponse >> ', res);
        if (res.data.status !== 'FAILURE') {
          cbOnSave();
          if (isPublished) {
            addToast('File published successfully.', 'success');
            history.push(
              isHedging ? PLAN_ROUTES.root : isInCMS ? CURRENY_MANAGEMENT_ROUTES.root : { pathname: UPLOAD_CSV_ROUTES.root, state: { mode } }
            );
          } else {
            // history.push(UPLOAD_CSV_ROUTES.root);
            addToast('Draft saved successfully.', 'success');
            //Reload component
          }
        } else {
          addToast(res.data.message, 'danger');
        }

        console.warn(res);
      });
  };

  return (
    <div className="flex flex-row items-end h-9 w-full mb-5">
      <div className="flex flex-col overflow-x-hidden w-full">
        <div className="mt-6 md:mt-0 ml-0 md:ml-6">
          <div className="flex items-start justify-between">
            <Text isBlock className={cn('text-lg flex flex-row items-end')}>
              CSV Data
            </Text>
            {console.log('formError >> ', formError)}
            {Boolean(formError) && (
              <Text className="text-sm mb-4" variant="danger" isBlock>
                {formError}
              </Text>
            )}
            <div className="flex items-center">
              {location.pathname.includes('edit') && (
                <>
                  <Button className="hidden text-sm lg:inline-flex" variant="dark" onClick={() => onSaveButtonTapped(false)} isRounded>
                    Save Draft
                  </Button>
                  <Button className="hidden text-sm lg:inline-flex ml-1" variant="success" onClick={() => onSaveButtonTapped(true)} isRounded>
                    Save &amp; Publish
                  </Button>
                </>
              )}
              <Button
                className="hidden text-sm lg:inline-flex ml-1"
                variant="info"
                href={
                  isHedging
                    ? { pathname: PLAN_ROUTES.root, state: { from: 'import', mode } }
                    : isInCMS
                    ? { pathname: CURRENY_MANAGEMENT_ROUTES.root, state: { from: 'import', mode } }
                    : { pathname: UPLOAD_CSV_ROUTES.root, state: { mode } }
                }
                isLink
                isRounded
              >
                Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
