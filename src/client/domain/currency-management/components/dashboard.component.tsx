import React, { useMemo, useState } from "react";
import cn from 'classnames';
import { DashboardChartContainer } from "./index";
import moment from "moment";
import { ManagedEntries } from "./managed.component";

type Props = {
  organisation: object;
  data: object[];
  chartBarClickable: boolean;
  handleBarClick: Function;
};

const BASE_CLASSES = ['flex', 'w-full', 'mx-auto', 'pb-2', 'items-center'];
const RESPONSIVE_CLASSES = ['md:pb-6', 'lg:px-12', 'lg:py-0', 'md:flex-row', 'md:items-start'];

export const Dashboard = ({ organisation, data, chartBarClickable, onAction, loading }: Props) => {
  const [selectedDate, setSelectedDate] = useState();

  const handleBarClick = date => setSelectedDate(selectedDate !== date ? date : '');

  const removeDate = (date) => {
    setSelectedDate(selectedDate.filter(d => d !== date));
  }

  const clearFilter = () => {
    setSelectedDate([]);
  }

  const tableLists = useMemo(() => {
    if (selectedDate) {
      return data.filter(r => selectedDate === moment(r.dateDue).format('MMM YYYY'));
    }

    return data;
  }, [data])

  return (
    <div className="flex w-full relative justify-center align-center flex-col">
      <div className={cn(BASE_CLASSES, RESPONSIVE_CLASSES, 'justify-center')} style={{ width: '100%' }}>
        <div className="flex flex-col w-full" style={{ width: '73%' }}>
          <div className={`mt-6 md:mt-0 ml-0 w-full`}>
            <DashboardChartContainer
              data={tableLists}
              handleBarClick={handleBarClick}
              dates={selectedDate}
              onRemoveDate={removeDate}
              clearFilter={clearFilter}
              organisation={organisation}
              isFullWidth
              chartBarClickable={chartBarClickable}
              loading={loading}
            />
          </div>
        </div>
      </div>
      <ManagedEntries hideTitle list={tableLists} organisation={organisation} onAction={onAction} dashboardMode showTotal/>
    </div>
  )
};
