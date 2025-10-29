import React, { useState } from 'react';
import { map } from 'lodash';
import { RadioButton } from './radio-button.component';

const items = [
  {
    value: 1,
    label: 'Radio button option one',
  },
  {
    value: 2,
    label: 'Radio button option two',
  },
  {
    value: 3,
    label: 'Radio button option three',
  },
];

export default {
  title: 'Components/RadioButton',
  component: RadioButton,
};

export const Index = () => {
  const [selectedValue, setSelectedValue] = useState<number | null>(null);

  return (
    <>
      {map(items, ({ value, label }, index) => (
        <RadioButton<number>
          key={index}
          name="storybook"
          value={value}
          isSelected={value === selectedValue}
          onChange={(value) => setSelectedValue(value)}
          className="mt-2"
        >
          {label}
        </RadioButton>
      ))}
      <RadioButton<number> name="storybook" value={1} isSelected onChange={(value) => setSelectedValue(value)} className="mt-2">
        This is the selected state
      </RadioButton>
    </>
  );
};
