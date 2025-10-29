import React, { memo } from 'react';
import { Button, Icon, Text } from '@client/common';
import { DASHBOARD_ROUTES } from '@client/dashboard';

export const ChartMobileSplash = memo(() => (
  <div className="flex flex-col items-center">
    <div className="inline-flex items-center justify-center bg-green-200 rounded-full p-4">
      <Icon className="text-green-500" icon="warning" width={24} height={24} />
    </div>
    <Text className="text-lg text-center mt-8" isBlock>
      The Fluenccy charts aren&apos;t supported on mobile yet. Please login via your laptop or desktop computer to view.
    </Text>

    <Button className="mt-8" variant="success" href={DASHBOARD_ROUTES.root} isLink isRounded>
      Return to dashboard
    </Button>
  </div>
));
