import React from 'react';
import { action } from '@storybook/addon-actions';
import { Checkbox } from './checkbox.component';

export default {
  title: 'Components/Checkbox',
  component: Checkbox,
};

export const Index = () => (
  <>
    <Checkbox className="mr-2" isChecked={false} onChange={() => action('Checked!')} />
    <Checkbox className="mr-2" isChecked={true} onChange={() => action('Checked!')} />
  </>
);
