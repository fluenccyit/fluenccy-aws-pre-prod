import React from 'react';
import { FluenccyLoader } from './fluenccy-loader.component';

export default {
  title: 'Components/FluenccyLoader',
  component: FluenccyLoader,
  parameters: {
    chromatic: {
      disable: true,
    },
  },
};

export const Index = () => (
  <>
    <FluenccyLoader />
    <FluenccyLoader variant="gray" />
  </>
);
