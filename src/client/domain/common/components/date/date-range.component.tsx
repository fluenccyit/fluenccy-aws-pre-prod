import React from "react";
import DatePicker from "react-datepicker";
import { subMonths } from "date-fns";

export const DateRange = ({ from, to, onChange }) => {
  // Calculate minimum date as 36 months ago from today
  const minDate = subMonths(new Date(), 36);
  
  // Set default date range to 12 months if not provided
  const defaultTo = to || new Date();
  const defaultFrom = from || subMonths(defaultTo, 12);

  const handleOnChange = (v, key) => {
    onChange({
      dateFrom: defaultFrom,
      dateTo: defaultTo,
      [key]: v
    });
  }

  return (
    <div className="flex justify-center w-full">
      <div className="flex justify-center items-center mr-4">
        <span className="font-bold mr-2">From:</span>
        <DatePicker
          selected={defaultFrom}
          onChange={(date) => handleOnChange(date, 'dateFrom')}
          minDate={minDate}
          maxDate={defaultTo}
          dateFormat="yyyy/MM"
          showMonthYearPicker
          showIcon
          placeholderText="Select start month"
        />
      </div>
      <div className="flex justify-center items-center mr-4">
        <span className="font-bold mr-2">To:</span>
        <DatePicker
          selected={defaultTo}
          onChange={(date) => handleOnChange(date, 'dateTo')}
          minDate={defaultFrom}
          maxDate={new Date()}
          dateFormat="yyyy/MM"
          showMonthYearPicker
          showIcon
          placeholderText="Select end month"
        />
      </div>
    </div>
  )
}