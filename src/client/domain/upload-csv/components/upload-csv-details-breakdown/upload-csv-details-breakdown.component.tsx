import React, { memo, useMemo, useCallback, useContext, useEffect } from 'react';
import cn from 'classnames';
import { GqlCurrencyScoreBreakdown, GqlArray } from '@graphql';
import { useJoinWaitlist, useQueryLocalOrganisation } from '@client/organisation';
import { uploadCSVService, useIsMarkupVisible, useQueryLocalUploadCSV } from '@client/upload-csv';
import { CURRENCY_SCORE_ALLOCATION, CURRENCY_SCORE_OVERALL_PERFORMANCE_LIMIT } from '@shared/upload-csv';
import { useDropzone } from 'react-dropzone';
import UploadIconSvg from '@assets/svg/icon-upload-cloud.svg';
import { UploadCSVDetailsBreakdownTooltip, CSVColumn } from '@client/upload-csv';

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
import UploadCSVContext from '@client/upload-csv/pages/upload-csv-context';

type Props = {
  breakdown: GqlCurrencyScoreBreakdown;
  columns: GqlArray;
  fileName: String;
  reviewStatus: String;
  mode?: string;
};

const OPTIONS = [
  // { label: ' Select Column ', value: '' },
  // { label: 'Invoice ID', value: 'invoiceNumber' },
  // { label: 'Contact Name', value: 'contactName' },
  // { label: 'Date', value: 'date' },
  // { label: 'Due Date', value: 'dateDue' },
  // { label: 'Total Amount', value: 'total' },
  // { label: 'Currency', value: 'currencyCode' },
  // { label: 'Rate', value: 'currencyRate' },
  // { label: 'Due', value: 'amountDue' },
  // { label: 'Paid', value: 'amountPaid' },
  // { label: 'Credited', value: 'amountCredited' },
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
  { label: 'Amount*', value: 'amount' },
  { label: 'Payment Month*', value: 'paymentMonth' },
  { label: 'Payment Year*', value: 'paymentYear' },
  { label: 'Foreign Currency Code*', value: 'foreignCurrencyCode' },
  { label: 'Budget Rate*', value: 'budgetRate' },
  { label: 'Home Currency Code*', value: 'homeCurrencyCode' },
];

export const UploadCSVDetailsBreakdown = memo(({ breakdown = {}, columns, fileName, reviewStatus, mode }: Props) => {
  const { ui } = useQueryLocalCommon();
  const { windowWidth } = useWindowWidth();
  const { joinWaitlist } = useJoinWaitlist();
  const isMarkupVisible = useIsMarkupVisible();
  const { organisation } = useQueryLocalOrganisation();
  const { isCurrencyScorePlanActive } = useQueryLocalUploadCSV();
  const { columnMappingData } = useContext(UploadCSVContext);

  const currencyScore = isCurrencyScorePlanActive ? breakdown.benchmarkCurrencyScore : breakdown.currencyScore;
  const markup = isCurrencyScorePlanActive ? breakdown.hedgedFxCost : breakdown.fxCost;
  const saving = isCurrencyScorePlanActive ? 0 : breakdown.performDeliveryGainLoss;
  const largestCurrencyScoreCurrencyByVolume = maxBy(breakdown.currencyScoreByCurrency, 'deliveryCost');
  const deliveryRate = largestCurrencyScoreCurrencyByVolume?.averageDeliveryRate || 0;

  let acceptedFileLength = 0;

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
  const { variant, label } = uploadCSVService.getPerformanceConfig(currencyScore, CURRENCY_SCORE_OVERALL_PERFORMANCE_LIMIT);
  const variantVal = reviewStatus == 'Uploaded' ? 'danger' : reviewStatus == 'Draft Saved' ? 'gray' : 'success';

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFileLength = acceptedFiles.length;

    // do something here
    console.log(acceptedFiles);
  }, []);
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    multiple: false,
    onDrop,
  });

  // const columns = ["CalendarDate", "SettlementCurrency", "ForeignCurrency", "PaymentRate", "ForeignAmount", "SettlementAmount", "Supplier", "BudgetRate"];

  return (
    <>
      <div className="min-w-chart-breakdown p-6 lg:block">
        <div className="mb-2">
          <Text className="text-lg mr-2">Upload Details</Text>
        </div>
        <Card>
          <CardContent className="p-6">
            <Text className="text-lg mb-2" isBlock>
              File
            </Text>
            <div className="flex items-center mb-2">
              <Text className="mr-1" isBlock>
                {fileName} &nbsp;
                <Badge variant={variantVal} size="sm" isRounded>
                  {reviewStatus}
                </Badge>
              </Text>
            </div>
            <CardSeparator hasCarat />

            <Text className="text-lg mb-2" isBlock>
              Column Mapping
            </Text>

            <div className="flex flex-col overflow-x-hidden w-full">
              {columns.map((columnName: string, index: number) => {
                let selected = '';
                if (Object.keys(columnMappingData).length > 0) {
                  let matched = OPTIONS.filter((obj) => columnMappingData[`${columnName}`] == obj.value);
                  console.log('matched record is =====>', matched);
                  console.log('matched record is =====>', columnMappingData[`${columnName}`]);

                  if (matched && matched.length == 1) {
                    selected = matched[0]?.value;
                    console.log('SELECTED VAL >>>> ', selected, 'Column Name', columnName);
                  }
                }

                return <CSVColumn columnName={columnName} index={index} selectedVal={selected} mode={mode} />;
              })}
            </div>
            {/* <CardSeparator hasCarat />
            <Text className="text-lg mb-2" isBlock>
              Activities
            </Text>
            <div className="flex">
              <div className="bg-gray-200 rounded-full w-3 mr-2" />
              <div className="w-full" style={{ marginLeft: '-19px' }}>
                <UploadCSVDetailsBreakdownTooltip variant="danger">
                  <Text className="text-sm font-bold" variant="gray">
                    <Text variant="danger">Uploaded</Text>
                  </Text>
                </UploadCSVDetailsBreakdownTooltip>
                <Text className="text-sm ml-6 mt-1" isBlock>
                  <Text className="font-bold">Matt Spehr</Text> uploaded file on
                  <Text className="font-bold mx-1">20-10-2020</Text>
                </Text>

                <UploadCSVDetailsBreakdownTooltip className="mt-4" variant="neutral">
                  <Text className="text-sm font-bold" variant="gray">
                    Saved <Text variant="dark">Draft</Text>
                  </Text>
                </UploadCSVDetailsBreakdownTooltip>
                <>
                  <Text className="text-sm ml-6 mt-1" isBlock>
                    <Text className="font-bold">Matt Spehr</Text> saved draft on
                    <Text className="font-bold mx-1">21-10-2020</Text>
                  </Text>
                </>

                <UploadCSVDetailsBreakdownTooltip className="mt-4" variant="success">
                  <Text className="text-sm font-bold" variant="gray">
                    Data <Text variant="success">Imported</Text>
                  </Text>
                </UploadCSVDetailsBreakdownTooltip>

                <Text className="text-sm ml-6 mt-1" isBlock>
                  <Text className="font-bold">Matt Spehr</Text> imported data on
                  <Text className="font-bold mx-1">22-10-2020</Text>
                </Text>
              </div>
            </div> */}
          </CardContent>
          {/* <CardContent className="p-6">
            <Button className={ctaClasses} isDisabled={acceptedFiles.length === 0} isRounded>
              Upload File
            </Button>
          </CardContent> */}
        </Card>
      </div>
    </>
  );
});
