import React, { memo } from 'react';
import { useIntercom } from 'react-use-intercom';
import { Banner, Button, Icon, Text } from '@client/common';

export const OnboardingErrorBanner = memo(() => {
  const { show: showIntercom } = useIntercom();

  return (
    <Banner variant="danger">
      <Icon className="text-red-500 flex-shrink-0 mr-2" icon="error-circle-outlined" />
      <Text className="text-xs" isBlock>
        There was an error with syncing your data so we are unable to produce your currency score.
        <Button className="mx-1" onClick={showIntercom} variant="danger" state="text">
          Contact Us
        </Button>
        for assistance.
      </Text>
    </Banner>
  );
});
