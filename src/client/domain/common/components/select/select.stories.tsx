import React from 'react';
import { action } from '@storybook/addon-actions';
import { Select } from './select.component';

export default {
  title: 'Components/Select',
  component: Select,
};  

const OPTIONS = [
  { label: 'Option 1', value: 'value-1' },
  { label: 'Option 2', value: 'value-2' },
];

const handleChange = (value: string) => action(value);

export const Index = () => (
  <div className="w-1/2">
    <Select options={OPTIONS} onChange={handleChange} />
    <Select className="mt-2" options={OPTIONS} onChange={handleChange} isError />
    <Select className="mt-2" options={OPTIONS} onChange={handleChange} isDisabled />
    <Select className="mt-2" options={OPTIONS} onChange={handleChange} isError isDisabled />
  </div>
);
