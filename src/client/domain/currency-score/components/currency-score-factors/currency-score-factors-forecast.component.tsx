import React, { memo } from 'react';
import { Badge, Text } from '@client/common';

export const CurrencyScoreFactorsForecast = memo(() => {
  return (
    <div className="py-8 px-4 w-full xl:py-0 xl:px-0">
      <Text className="text-lg">Forecast</Text>
      <Badge className="ml-4" variant="success" state="solid">
        Coming soon
      </Badge>
      <Text className="text-sm mt-6 md:w-1/2 md:max-w-lg" variant="gray" isBlock>
        Creating a forecast for your currency requirements, helps us to better shape your currency plan so you don&apos;t have any nasty surprises.
      </Text>
    </div>
  );
});
