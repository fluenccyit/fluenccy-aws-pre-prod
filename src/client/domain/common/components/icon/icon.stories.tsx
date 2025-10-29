import React from 'react';
import { map } from 'lodash';
import { Icon } from './icon.component';

export default {
  title: 'Components/Icon',
  component: Icon,
};

const colourClasses = ['text-gray-900', 'text-green-500', 'text-red-500', 'text-blue-500', 'text-orange-500', 'text-gray-500', 'text-xero-blue'];

export const Index = () => (
  <>
    {map(colourClasses, (colourClass) => (
      <div key={colourClass}>
        <Icon className={`mr-1 ${colourClass}`} icon="account" />
        <Icon className={`mr-1 ${colourClass}`} icon="add-circle-filled" />
        <Icon className={`mr-1 ${colourClass}`} icon="carat-down" />
        <Icon className={`mr-1 ${colourClass}`} icon="carat-right" />
        <Icon className={`mr-1 ${colourClass}`} icon="carat-up" />
        <Icon className={`mr-1 ${colourClass}`} icon="chart" />
        <Icon className={`mr-1 ${colourClass}`} icon="close" />
        <Icon className={`mr-1 ${colourClass}`} icon="error-circle-outlined" />
        <Icon className={`mr-1 ${colourClass}`} icon="idea" />
        <Icon className={`mr-1 ${colourClass}`} icon="info-circle-filled" />
        <Icon className={`mr-1 ${colourClass}`} icon="logout" />
        <Icon className={`mr-1 ${colourClass}`} icon="org" />
        <Icon className={`mr-1 ${colourClass}`} icon="payables" />
        <Icon className={`mr-1 ${colourClass}`} icon="recalculate-scores" />
        <Icon className={`mr-1 ${colourClass}`} icon="receivables" />
        <Icon className={`mr-1 ${colourClass}`} icon="refresh-token" />
        <Icon className={`mr-1 ${colourClass}`} icon="resync-invoices" />
        <Icon className={`mr-1 ${colourClass}`} icon="rubbish-bin" />
        <Icon className={`mr-1 ${colourClass}`} icon="share" />
        <Icon className={`mr-1 ${colourClass}`} icon="tick-circle-filled" />
        <Icon className={`mr-1 ${colourClass}`} icon="tick-circle-outlined" />
        <Icon className={`mr-1 ${colourClass}`} icon="tick" />
        <Icon className={`mr-1 ${colourClass}`} icon="warning" />
      </div>
    ))}
  </>
);
