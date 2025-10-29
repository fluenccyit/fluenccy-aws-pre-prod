import { Select, SelectOption } from '@client/common';
import { sharedDateTimeService } from '@shared/common';
import React, { useState } from 'react';

type Props = {
  setDateFrom: (date: Date) => void;
  isDisabled: boolean;
};

export const AdminOrganisationDateRangeSelect = ({ setDateFrom, isDisabled }: Props) => {
  const [months, setMonths] = useState('6');
  const DATE_OPTIONS: SelectOption<string>[] = [
    {
      label: '6 months',
      value: '6',
    },
    {
      label: '12 months',
      value: '12',
    },
    {
      label: '18 months',
      value: '18',
    },
  ];

  const handleChange = (value: string) => {
    setMonths(value);
    setDateFrom(sharedDateTimeService.getUtcDateFromMonthsAgo(Number(value)));
  };

  return <Select options={DATE_OPTIONS} value={months} onChange={handleChange} isDisabled={isDisabled} />;
};
