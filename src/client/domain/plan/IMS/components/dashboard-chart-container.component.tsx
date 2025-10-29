import React, { useMemo } from 'react';
import { groupBy, uniqBy } from 'lodash';
import { Button, Card, CardContent, useQueryLocalCommon, FlagIcon, Text, Icon } from '@client/common';
import { DashboardChart, CurrencyAmount } from '@client/plan/IMS/components';
import xeroNoDataImage from '@assets/images/xero-no-data.png';
import moment from 'moment';
import styled from 'styled-components';
import Select, { components } from 'react-select';
import { useHistory } from 'react-router-dom';

const { Option } = components;

type Props = {
  data: object[];
  currency: string;
  handleBarClick: Function;
};

const defaultRecord = {
  Unmanaged: 0.0,
  Forward: 0.0,
  'Order/Spot': 0.0,
  Forward: 0.0,
  total: 0.0,
  orgTotal: 0.0,
};

export const DashboardChartContainer = ({
  getOptimisedInvoices,
  chartBarClickable,
  isFullWidth,
  managedInvoices,
  data,
  handleBarClick,
  currency,
  dates = '',
  filterByCurrency,
  onRemoveDate,
  onRemoveCurrency,
  clearFilter,
  organisation,
  optimisedInvoices,
  currencies,
  mode,
  homeCurrencies,
  homeCurrency,
  filterByHomeCurrency,
}: Props) => {
  const { ui } = useQueryLocalCommon();
  const history = useHistory();
  const goToFullReport = () => {};
  const gotoImsDashboard = () => history.push({ pathname: '/plan', state: { showDashboard: true, mode } });

  const memorizedData = useMemo(() => {
    const groupByDate = groupBy(data, (v) => moment(v.dateDue).format('MMM YYYY'));
    const counter = [0, 1, 2, 3, 4, 5];
    const frdAmountByCurrency = {};
    const records = counter.reduce((acc, i) => {
      const date = moment().add(i, 'months').format('MMM YYYY');
      const arr = groupByDate[date];
      let record = { ...defaultRecord, dateDue: date };

      if (arr) {
        record = arr.reduce(
          (acc, r = {}) => {
            const {
              forwardValue = 0,
              orderValue = 0,
              spotValue = 0,
              executedForwardValue,
              executedForwardRate,
              executedOrderValue,
              executedOrderRate,
              executedSpotRate,
              executedSpotValue,
              forwardRate = 1,
              optimizedRate = 1,
              optimaisedValue,
              optimaisedPer,
              isHedgedEverything,
            } = r.buyingSchedule || {};

            if (r.isApproved === 'true') {
              if (!currency) {
                if (executedForwardValue) {
                  acc['Forward'] = (acc['Forward'] || 0) + Number(executedForwardValue) / executedForwardRate;
                } else {
                  acc['Forward'] =
                    (acc['Forward'] || 0) +
                    Number(isHedgedEverything ? r.total : forwardValue) / Number(isHedgedEverything ? optimizedRate : forwardRate);
                }

                if (!isHedgedEverything) {
                  if (executedOrderValue) {
                    acc['Forward'] = (acc['Forward'] || 0) + Number(executedOrderValue) / executedOrderRate;
                  } else {
                    acc['Order/Spot'] = (acc['Order/Spot'] || 0) + Number(orderValue) / optimizedRate;
                  }

                  if (executedSpotValue) {
                    acc['Forward'] = (acc['Forward'] || 0) + Number(executedSpotValue) / executedSpotRate;
                  } else {
                    acc['Order/Spot'] = (acc['Order/Spot'] || 0) + Number(spotValue) / Number(optimizedRate);
                  }
                }
              } else {
                if (executedForwardValue) {
                  acc['Forward'] = (acc['Forward'] || 0) + Number(executedForwardValue);
                } else {
                  acc['Forward'] = (acc['Forward'] || 0) + Number(isHedgedEverything ? r.total : forwardValue);
                }

                if (!isHedgedEverything) {
                  if (executedOrderValue) {
                    acc['Forward'] = (acc['Forward'] || 0) + Number(executedOrderValue);
                  } else {
                    acc['Order/Spot'] = (acc['Order/Spot'] || 0) + Number(orderValue);
                  }

                  if (executedSpotValue) {
                    acc['Forward'] = (acc['Forward'] || 0) + Number(executedSpotValue);
                  } else {
                    acc['Order/Spot'] = (acc['Order/Spot'] || 0) + Number(spotValue);
                  }
                }
              }
              if (isHedgedEverything) {
                console.log('executedForwardValue', executedForwardValue, 'total', r.total);
                acc.orgTotal = (acc.orgTotal || 0) + Number(executedForwardValue || r.total) / (executedForwardRate || optimizedRate);
                frdAmountByCurrency[r.currencyCode] = Number(frdAmountByCurrency[r.currencyCode] || 0) + Number(executedForwardValue);
              } else {
                acc.orgTotal =
                  (acc.orgTotal || 0) +
                  Number(executedForwardValue || forwardValue) / (executedForwardRate || forwardRate) +
                  (Number(executedOrderValue || orderValue) / Number(executedOrderRate || optimizedRate) + Number(executedOrderValue || spotValue)) /
                    Number(executedSpotRate || optimizedRate);
                frdAmountByCurrency[r.currencyCode] =
                  (frdAmountByCurrency[r.currencyCode] || 0) + Number(executedForwardValue) + Number(executedSpotValue) + Number(executedOrderValue);
              }
              acc['Unmanaged'] = (acc['Unmanaged'] || 0) + 0;
            } else {
              const optimisedRecord = optimisedInvoices.find((rec) => rec.invoiceId === r.invoiceId);
              let optimizedTargetCost =
                typeof getOptimisedInvoices == 'undefined'
                  ? 0
                  : Number(isHedgedEverything ? optimaisedValue : getOptimisedInvoices([r])[0].targetCost);
              if (!currency) {
                acc['Unmanaged'] =
                  (acc['Unmanaged'] || 0) +
                  Number(isHedgedEverything ? optimaisedValue || 0 : optimisedRecord.targetCost || optimizedTargetCost || 0);
              } else {
                acc['Unmanaged'] = (acc['Unmanaged'] || 0) + Number(r.total);
              }
              acc['Order/Spot'] = (acc['Order/Spot'] || 0) + 0;
              acc['Forward'] = (acc['Forward'] || 0) + 0;
              acc.orgTotal =
                (acc.orgTotal || 0) + Number(isHedgedEverything ? optimaisedValue || 0 : optimisedRecord.targetCost || optimizedTargetCost || 0);
              frdAmountByCurrency[r.currencyCode] = (frdAmountByCurrency[r.currencyCode] || 0) + 0;
            }
            acc.dateDue = moment(r.dateDue).format('MMM YYYY');

            return acc;
          },
          { ...defaultRecord, dateDue: date }
        );
      }

      record.currency = currency;
      record.total = Number(record.Forward) + Number(record['Order/Spot']) + Number(record.Unmanaged);
      record.Forward = Number(record.Forward).toFixed(2);
      record['Order/Spot'] = Number(record['Order/Spot']).toFixed(2);
      record.Unmanaged = Number(record.Unmanaged).toFixed(2);
      if (!currency) {
        record.currency = organisation.currency;
      }
      return [...acc, record];
    }, []);
    return { records, frdAmountByCurrency };
  }, [data, optimisedInvoices]);

  const { records, frdAmountByCurrency } = memorizedData;

  const memoCurrencyOptions = useMemo(() => {
    let data = currencies;
    if (homeCurrency) {
      data = data.filter((d) => d.currencyPair === `${homeCurrency}${d.currencyCode}`);
    }
    data = data.map((c) => ({ label: c.currencyCode, value: c.currencyCode }));

    if (mode !== 'receivables') {
      data.push({ label: `${organisation.currency}(Home)`, value: organisation.currency });
    }
    return uniqBy(data, (v) => v.value);
  }, [currencies, homeCurrency]);

  const memoHomeCurrencyOptions = useMemo(() => {
    const data = homeCurrencies?.map((c) => ({ label: c, value: c }));
    return data;
  }, [homeCurrencies]);

  const renderChart = () => {
    if (data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center" style={{ height: 350 }}>
          <div className="w-24 h-36 mb-3.5">
            <img className="w-24 h-36" src={xeroNoDataImage} alt="Hand holding single bar from graph" />
          </div>
          <Text className="font-bold mb-3.5">No Data</Text>
          <Text className="text-sm max-w-md text-center">There is no data to display.</Text>
        </div>
      );
    } else {
      return (
        <DashboardChart
          chartBarClickable={chartBarClickable}
          isFullWidth={isFullWidth}
          data={records}
          handleBarClick={handleBarClick}
          currency={currency || organisation.currency}
          selectedDate={dates}
          homeCurrency={homeCurrency}
          mode={mode}
        />
      );
    }
  };

  const filterInvoices = useMemo(() => {
    if (mode === 'receivables') {
      return managedInvoices.filter((r) => r.homeCurrencyCode === homeCurrency);
    }
    return managedInvoices;
  }, [managedInvoices, homeCurrency]);

  return (
    <>
      <Card className="mb-4">
        <CardContent className="py-4">
          <span className="flex mb-1 ml-2">{mode === 'receivables' ? 'Wallet' : 'Currency Reserved'}</span>
          <CurrencyAmount
            frdAmountByCurrency={frdAmountByCurrency}
            filterByCurrency={filterByCurrency}
            selected={currency}
            organisation={organisation}
            convertedData={filterInvoices}
            currencies={currencies}
            mode={mode}
            homeCurrency={homeCurrency}
          />
        </CardContent>
      </Card>
      <Card className="overflow-hidden pt-2">
        <CardContent className="p-2">
          <StyledLegends className="flex items-center justify-between">
            <div className="flex items-center justify-center w-full">
              <StyledLegendItem className="flex items-center" color="#DEDFEA">
                <span className="indicator" />
                <span className="title">No Plan</span>
              </StyledLegendItem>
              <StyledLegendItem className="flex items-center" color="rgba(16, 188, 106, 0.25)">
                <span className="indicator" />
                <span className="title">Plan In Place</span>
              </StyledLegendItem>
              <StyledLegendItem className="flex items-center" color="#10BC6A">
                <span className="indicator" />
                <span className="title">{mode === 'receivables' ? 'Wallet' : 'Currency Reserved'}</span>
              </StyledLegendItem>
            </div>
            <div className="flex justify-end items-center w-full">
              {mode === 'receivables' && (
                <>
                  <div className="mr-2">
                    <Icon icon="home" style={{ width: '20px' }} />
                  </div>
                  <Select
                    defaultValue={memoHomeCurrencyOptions[memoHomeCurrencyOptions.length - 1]}
                    options={memoHomeCurrencyOptions}
                    components={{ Option: IconOption, Control }}
                    onChange={filterByHomeCurrency}
                    value={memoHomeCurrencyOptions.find((o) => o.value === homeCurrency)}
                    isSearchable={false}
                    className="mr-2"
                  />
                  <div className="mr-2 ml-3">
                    <span className="title font-bold">RX</span>
                  </div>
                </>
              )}
              <Select
                defaultValue={memoCurrencyOptions[memoCurrencyOptions.length - 1]}
                options={memoCurrencyOptions}
                components={{ Option: IconOption, Control }}
                onChange={filterByCurrency}
                value={
                  mode === 'receivables'
                    ? memoCurrencyOptions.find((o) => o.value === currency) || ''
                    : memoCurrencyOptions.find((o) => o.value === (currency || organisation.currency)) || ''
                }
                isSearchable={false}
                className=""
              />
              {isFullWidth && (
                <Button isLink isRounded onClick={gotoImsDashboard} style={{ marginLeft: '15px', paddingTop: '6px', paddingBottom: '6px' }}>
                  View Full Report
                </Button>
              )}
            </div>
          </StyledLegends>
          {renderChart()}
          <Button
            className="inline-flex text-sm w-full mt-8 lg:hidden"
            variant="success"
            onClick={goToFullReport}
            isDisabled={ui === 'saving'}
            isLink
            isRounded
          >
            Get the full report
          </Button>
        </CardContent>
      </Card>
    </>
  );
};

const IconOption = (props) => (
  <Option {...props}>
    <div className="w-full flex items-center" style={{ minWidth: '150px' }}>
      <FlagIcon currency={props.data.value} style={{ 'margin-right': '5px' }} />
      <span className="ml-2">{props.data.label}</span>
    </div>
  </Option>
);

const Control = ({ children, ...props }) => {
  const { selectProps } = props;

  return (
    <components.Control {...props} className="pl-2">
      <div className="w-full flex items-center justify-between" style={{ minWidth: '150px' }}>
        <div className="flex items-center">
          <FlagIcon currency={selectProps.value?.value} />
          <span className="ml-2 flex">{selectProps.value?.value}</span>
        </div>
        {children[1]}
      </div>
    </components.Control>
  );
};

const StyledLegends = styled.div`
  .legend-container {
    margin-left: 30%;
    margin-right: 10%;
  }
`;
const StyledLegendItem = styled.div`
  margin-right: 12px;
  .indicator {
    background: ${({ color }) => color};
    border-radius: 4px;
    width: 12px;
    height: 12px;
    margin-right: 8px;
  }
  .title {
    color: #1c1336;
    font-size: 12px;
  }
`;
