import { map } from 'lodash';
import React from 'react';
import { Text } from './text.component';

export default {
  title: 'Components/Text',
  component: Text,
};

const variants = ['dark', 'gray', 'light', 'success', 'warning', 'danger', 'info'] as const;

export const Index = () => (
  <>
    <div>
      {map(variants, (variant) => (
        <Text key={variant} className="mr-2" variant={variant}>
          {variant}
        </Text>
      ))}
    </div>
    <div className="mt-2">
      {map(variants, (variant) => (
        <Text key={variant} variant={variant} isBlock>
          {variant}
        </Text>
      ))}
    </div>
    <div className="bg-gray-900 p-4 mt-2">
      {map(variants, (variant) => (
        <Text key={variant} className="mr-2" variant={variant}>
          {variant}
        </Text>
      ))}
    </div>
    <div className="bg-gray-900 p-4 mt-2">
      {map(variants, (variant) => (
        <Text key={variant} variant={variant} isBlock>
          {variant}
        </Text>
      ))}
    </div>
  </>
);
