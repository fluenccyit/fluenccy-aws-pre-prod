import React, { useMemo } from 'react';
import { groupBy } from 'lodash';
import { Card, CardContent, Text } from '@client/common';
import { DashboardChart } from '@client/currency-management';
import xeroNoDataImage from '@assets/images/xero-no-data.png';
import moment from "moment";
import styled from "styled-components";

type Props = {
  data: object[];
  currency: string;
  handleBarClick: Function;
};

const defaultRecord = {
  Unmanaged: 0.00,
  Forward: 0.00,
  "Order/Spot": 0.00,
  Forward: 0.00,
  total: 0.00,
  orgTotal: 0.00
};

export const DashboardChartContainer = ({ chartBarClickable, isFullWidth, data, handleBarClick, dates = '', loading, clearFilter, organisation }: Props) => {
  const memorizedData = useMemo(() => {
    const groupByDate = groupBy(data, v => {
      if(moment(`01-${v.month}-${v.year}`).valueOf() < 0) {
        return moment(`01/${v.month}/${v.year}`).format('MMM YYYY');
      } else {
        return moment(`01-${v.month}-${v.year}`).format('MMM YYYY');
      }
      
      // moment(`01/${v.month}/${v.year}`).format('MMM YYYY')
    });
    const counter = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const records = counter.reduce((acc, i) => {
      const date = moment().add(i, 'months').format('MMM YYYY');
      const arr = groupByDate[date];
      let record = {...defaultRecord, dateDue: date};

      if (arr) {
        record = arr.reduce((acc, r = {}) => {
          let totalReservedAmount = (r.feedbacks || []).reduce((sum, o) => sum + Number(o.reservedAmount), 0);
          totalReservedAmount = totalReservedAmount > Number(r.forecaseAmount) ? r.forecaseAmount : totalReservedAmount;
          if (r.feedbacks?.length) {
            acc['Forward'] = (acc['Forward'] || 0) + Number(totalReservedAmount);
            acc['Unmanaged'] = (acc['Unmanaged'] || 0) + Number(r.forecaseAmount) - Number(totalReservedAmount);
          } else {
            acc['Unmanaged'] = (acc['Unmanaged'] || 0) + Number(r.forecaseAmount);
            acc['Forward'] = (acc['Forward'] || 0) + 0;
          }
            
          if(moment(`01/${r.month}/${r.year}`).valueOf() < 0 ) {
            acc.dateDue = moment(`01/${r.month}/${r.year}`).format('MMM YYYY');
          } else {
            acc.dateDue = moment(`01-${r.month}-${r.year}`).format('MMM YYYY');
          }
          // acc.dateDue = moment(`01/${r.month}/${r.year}`).format('MMM YYYY');

          return acc;
        }, {...defaultRecord, dateDue: date});
      }

      record.Forward = Number(record.Forward).toFixed(2);
      record.Unmanaged = Number(record.Unmanaged).toFixed(2);
      return [...acc, record];
    }, []);
    return { records };
  }, [data]);

  const { records } = memorizedData;

  const renderChart = () => {
    if (data.length === 0 && !loading) {
      return (
        <div className="flex flex-col items-center justify-center w-full" style={{ height: 350 }}>
          <div className="w-24 h-36 mb-3.5">
            <img className="w-24 h-36" src={xeroNoDataImage} alt="Hand holding single bar from graph" />
          </div>
          <Text className="font-bold mb-3.5">No Data</Text>
          <Text className="text-sm max-w-md text-center">There is no data to display.</Text>
        </div>
      );
    } else {
      return <DashboardChart chartBarClickable={chartBarClickable} isFullWidth={isFullWidth} data={records} handleBarClick={handleBarClick} selectedDate={dates} />;
    }
  };

  return (
    <>
      <Card className="overflow-hidden pt-2">
        <CardContent className="p-2">
          <StyledLegends className="flex items-center justify-between">
            <div className="flex items-center justify-center w-full">
              {/* <StyledLegendItem className="flex items-center" color="#DEDFEA">
                <span className="indicator" />
                <span className="title">No Plan</span>
              </StyledLegendItem> */}
              <StyledLegendItem className="flex items-center" color="#10BC6A">
                <span className="indicator" />
                <span className="title">Executed</span>
              </StyledLegendItem>
            </div>
          </StyledLegends>
          {renderChart()}
        </CardContent>
      </Card>
    </>
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
  color: #1C1336;
  font-size: 12px;
}
`;
