import React, { ChangeEvent } from 'react';
import { action } from '@storybook/addon-actions';
import { TextArea } from './text-area.component';

export default {
  title: 'Components/TextArea',
  component: TextArea,
};

const handleChange = ({ target }: ChangeEvent<HTMLTextAreaElement>) => action(target.value);

export const Index = () => (
  <div className="w-1/2">
    <TextArea onChange={handleChange} />
    <TextArea className="mt-2" onChange={handleChange} placeholder="Has placeholder" />
    <TextArea className="mt-2" onChange={handleChange} placeholder="Error" isError />
    <TextArea className="mt-2" onChange={handleChange} placeholder="Disabled" isDisabled />
    <TextArea className="mt-2" onChange={handleChange} placeholder="Error Disabled" isError isDisabled />
  </div>
);
