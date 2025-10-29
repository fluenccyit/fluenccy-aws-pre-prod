import React from 'react';
import { Indicator } from './indicator.component';

export default {
  title: 'Components/Indicator',
  component: Indicator,
};

export const Index = () => (
  <>
    <Indicator className="mr-2" variant="success" />
    <Indicator className="mr-2" variant="neutral" />
    <Indicator className="mr-2" variant="danger" />
  </>
);
