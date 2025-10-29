import React, { memo, useMemo, useCallback, useContext, useEffect } from 'react';
import { GqlCurrencyScoreBreakdown } from '@graphql';
import { useQueryLocalOrganisation } from '@client/organisation';
import { useDropzone } from 'react-dropzone';
import { Icon, ProgressBar } from '@client/common';

import { Card, CardContent, Text, useToast, Table } from '@client/common';
import UploadCSVContext from '@client/upload-csv/pages/upload-csv-context';

type Props = {
  breakdown: GqlCurrencyScoreBreakdown;
};

export const UploadCSVBreakdown = memo(({ isHedging, onSuccess, mode }) => {
  const { organisation } = useQueryLocalOrganisation();
  const { addToast } = useToast();

  const { sendUploadFile, sendUploadFileData, fileUploadProgress }: any = useContext(UploadCSVContext);

  useEffect(() => {}, [fileUploadProgress]);

  if (!organisation) {
    return null;
  }

  const onDrop = useCallback(
    (acceptedFiles) => {
      console.log('in on upload file button tapped', acceptedFiles[0]);

      if (!acceptedFiles[0].type.toLowerCase().includes('csv') && !acceptedFiles[0].type.toLowerCase().includes('application/vnd.ms-excel')) {
        addToast('Please select/upload CSV file.', 'danger');
        console.log('invalid file format');
        acceptedFiles[0].path = '';
        return;
      }

      sendUploadFileData({
        uploadId: acceptedFiles[0].lastModified,
        type: acceptedFiles[0].type,
        uploadDate: 'new',
        currentStatus: 'Uploaded',
        mode,
      });
      console.log('after senduploadfiledata');
      sendUploadFile(acceptedFiles[0], { isHedging, onSuccess, mode });

      setTimeout(
        function () {
          //Start the timer
          // history.push(UPLOAD_CSV_ROUTES.root);
          //After 1 second, set render to true
        }.bind(this),
        1000
      );
    },
    [sendUploadFileData]
  );
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    multiple: false,
    onDrop,
    accept: '.csv',
  });

  return (
    <div className="min-w-chart-breakdown p-6 lg:block w-full">
      <div className="mb-3 flex-col flex items-center">
        <Text className="text-lg mr-2">Upload your files</Text>
        <Text className="text-sm mr-2" variant="gray">
          File should be CSV
        </Text>
      </div>
      <Card>
        <CardContent>
          <div className="flex justify-center">
            <div
              {...getRootProps()}
              className={`flex rounded-lg flex-col items-center border border-dashed border-gray-500 cursor-pointer w-full h-full p-10 dropzone ${
                isDragActive && 'isActive'
              }`}
            >
              <input {...getInputProps()} />
              <Icon icon="csv-file" className="mb-4" width={50} height={50} style={{ color: 'green' }} />
              <Text className="text-center text-sm" variant="gray">
                {isDragActive ? 'Drop the file here ...' : "Drag 'n' drop or click to select file."}
              </Text>
            </div>
          </div>
          {/* <Button onClick={onUploadFileButtonTapped}>Upload File</Button> */}
        </CardContent>
      </Card>
      {!!fileUploadProgress && (
        <>
          <Text className="text-lg mb-1 mt-4 block">Uploaded file</Text>
          <ProgressBar className="mt-1.5" separatorClassName="bg-gray" total={100} completed={fileUploadProgress} title={acceptedFiles[0]?.path} />
        </>
      )}
    </div>
  );
});
