import React from 'react';
import { map } from 'lodash';
import { FlagIcon } from './flag-icon.component';
import { SUPPORTED_CURRENCIES } from '@shared/rate';

export default {
  title: 'Components/FlagIcon',
  component: FlagIcon,
};

export const Index = () => (
  <>
    {map(SUPPORTED_CURRENCIES, (currency) => (
      <FlagIcon key={currency} className="mr-2" currency={currency} />
    ))}
  </>
);
