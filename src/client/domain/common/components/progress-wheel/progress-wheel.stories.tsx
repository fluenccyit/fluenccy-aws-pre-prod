import React from 'react';
import { ProgressWheel } from './progress-wheel.component';
import { Text } from '@client/common';
import { round } from 'lodash';

export default {
  title: 'Components/ProgressWheel',
  component: ProgressWheel,
  argTypes: {
    total: {
      control: { type: 'number' },
    },
    completed: {
      control: { type: 'number' },
    },
  },
};

export const Index = ({ ...args }) => (
  <>
    <ProgressWheel total={args.total || 5} completed={args.completed || 2} variant="danger" size="sm" />
    <ProgressWheel total={args.total || 5} completed={args.completed || 3} variant="warning" />
    <ProgressWheel total={args.total || 5} completed={args.completed || 4} size="lg">
      <Text isBlock className="text-5xl">
        {round(((args.completed || 4) / (args.total || 5)) * 100)}%
      </Text>
      <Text isBlock className="text-3xl mt-4">
        Good
      </Text>
    </ProgressWheel>
    <ProgressWheel total={args.total || 850} completed={args.completed || 487} size="xl" variant="warning">
      <Text className="text-center text-xl" isBlock>
        Your currency score is
      </Text>
      <Text className="text-center text-6xl mt-2" isBlock>
        {args.completed || 487}/{args.total || 850}
      </Text>
      <Text className="text-center text-xl mt-10" isBlock>
        Performance
      </Text>
      <Text className="text-center text-3xl mt-2" isBlock>
        Average
      </Text>
    </ProgressWheel>
  </>
);
