import React from 'react';
import { ProgressBar } from './progress-bar.component';

export default {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  argTypes: {
    total: {
      control: { type: 'number' },
    },
    completed: {
      control: { type: 'number' },
    },
  },
};

export const Index = ({ ...args }) => {
  return <ProgressBar total={args.total || 5} completed={args.completed || 3} />;
};
