import React, { ChangeEvent } from 'react';
import { action } from '@storybook/addon-actions';
import { Input } from './input.component';

export default {
  title: 'Components/Input',
  component: Input,
};

const handleChange = ({ target }: ChangeEvent<HTMLInputElement>) => action(target.value);

export const Index = () => (
  <div className="w-1/2">
    <Input onChange={handleChange} />
    <Input className="mt-2" onChange={handleChange} placeholder="Has placeholder" />
    <Input className="mt-2" onChange={handleChange} placeholder="Error" isError />
    <Input className="mt-2" onChange={handleChange} placeholder="Disabled" isDisabled />
    <Input className="mt-2" onChange={handleChange} placeholder="Error Disabled" isError isDisabled />
  </div>
);
