import React, { memo, useMemo, useCallback, useContext, useEffect } from 'react';
import cn from 'classnames';
import { GqlCurrencyScoreBreakdown } from '@graphql';
import { useJoinWaitlist, useQueryLocalOrganisation } from '@client/organisation';
import { planUploadCSVService } from '@client/plan';
import { CURRENCY_SCORE_ALLOCATION, CURRENCY_SCORE_OVERALL_PERFORMANCE_LIMIT } from '@shared/upload-csv';
import { useDropzone } from 'react-dropzone';
import UploadIconSvg from '@assets/svg/icon-upload-cloud.svg';
import { ProgressBar } from '@client/common';

import {
    Badge,
    Button,
    Card,
    CardContent,
    CardSeparator,
    NumberAnimation,
    ProgressWheel,
    TAILWIND_SCREEN_MD,
    Text,
    useQueryLocalCommon,
    useWindowWidth,
    utilService,
    Table,
} from '@client/common';
import { maxBy } from 'lodash';
// import { useMutationUploadFile } from '@client/upload-csv/graphql/use-mutation-upload-csv.graphql';
import PlanUploadCSVContext from '@client/plan/pages/plan-context';
import { useHistory } from 'react-router';

type Props = {
    breakdown: GqlCurrencyScoreBreakdown;
};

export const PlanUploadCSVBreakdown = memo(() => {
    const { ui } = useQueryLocalCommon();
    const { windowWidth } = useWindowWidth();
    const { joinWaitlist } = useJoinWaitlist();
  //  const isMarkupVisible = useIsMarkupVisible();
    const { organisation } = useQueryLocalOrganisation();
   // const { isCurrencyScorePlanActive } = useQueryLocalUploadCSV();
    const history = useHistory();

    // const { uploadFile } = useMutationUploadFile();
    // const currencyScore = isCurrencyScorePlanActive ? breakdown.benchmarkCurrencyScore : breakdown.currencyScore;
    // const markup = isCurrencyScorePlanActive ? breakdown.hedgedFxCost : breakdown.fxCost;
    // const saving = isCurrencyScorePlanActive ? 0 : breakdown.performDeliveryGainLoss;
    // const largestCurrencyScoreCurrencyByVolume = maxBy(breakdown.currencyScoreByCurrency, 'deliveryCost');
    // const deliveryRate = largestCurrencyScoreCurrencyByVolume?.averageDeliveryRate || 0;

    const { sendUploadFile, sendUploadFileData, fileUploadProgress } = useContext(PlanUploadCSVContext);
    let acceptedFileLength = 0;

    useEffect(() => { }, [fileUploadProgress]);

    const progressWheelSize = useMemo(() => {
        if (windowWidth <= TAILWIND_SCREEN_MD) {
            return 'xs';
        }

        return 'md';
    }, [windowWidth]);

    if (!organisation) {
        return null;
    }

    const ctaClasses = cn('w-full mt-5', organisation.intentRegistered && 'pointer-events-none');
  //  const { variant, label } = planUploadCSVService.getPerformanceConfig(currencyScore, CURRENCY_SCORE_OVERALL_PERFORMANCE_LIMIT);

    const onDrop = useCallback((acceptedFiles) => {
        console.log('in on upload file button tapped', acceptedFiles[0]);
        sendUploadFileData({
            uploadId: acceptedFiles[0].lastModified,
            type: acceptedFiles[0].type,
            uploadDate: 'new',
            currentStatus: 'Uploaded',
        });
        console.log('after senduploadfiledata');
        sendUploadFile(acceptedFiles[0]);

        setTimeout(
            function () {
                //Start the timer
                history.push(UPLOAD_CSV_ROUTES.root);
                //After 1 second, set render to true
            }.bind(this),
            1000
        );
    }, []);
    const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
        multiple: false,
        onDrop,
    });

    const onUploadFileButtonTapped = () => {
        // sendUploadFileData(acceptedFiles[0]);
        console.log('in on upload file button tapped', acceptedFiles[0]);
        sendUploadFileData({
            uploadId: acceptedFiles[0].lastModified,
            type: acceptedFiles[0].type,
            uploadDate: 'new',
            currentStatus: 'Uploaded',
        });
        console.log('after senduploadfiledata');
        sendUploadFile(acceptedFiles[0]);

        // await uploadFile({ variables: { file: acceptedFiles } });
    };

    return (
        <>
            <div className="hidden min-w-chart-breakdown max-w-chart-breakdown p-6 lg:block">
                <div className="mb-2">
                    <Text className="text-lg mr-2">Import Data</Text>
                </div>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-center mb-4">
                            <div
                                {...getRootProps()}
                                className={`border border-dashed border-gray-500 cursor-pointer w-full h-full p-10 dropzone ${isDragActive && 'isActive'}`}
                            >
                                <input {...getInputProps()} />
                                {isDragActive ? <p>Drop the files here ...</p> : <p>Drag 'n' drop some files here, or click to select files</p>}
                            </div>
                        </div>
                        <label> {acceptedFiles[0]?.path} </label>
                        <ProgressBar className="mt-1.5" separatorClassName="bg-green" total={100} completed={fileUploadProgress} />

                        {/* <Button onClick={onUploadFileButtonTapped}>Upload File</Button> */}
                    </CardContent>
                </Card>
            </div>
        </>
    );
});
