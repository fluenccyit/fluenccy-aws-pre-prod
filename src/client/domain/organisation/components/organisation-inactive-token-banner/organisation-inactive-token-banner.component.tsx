import React, { memo } from 'react';
import { Banner, Button, Icon, Text } from '@client/common';

type Props = {
  isFullScreen?: boolean;
};

export const OrganisationInactiveTokenBanner = memo(({ isFullScreen, absolute = false }: Props) => (
  <Banner variant="info" isFullScreen={isFullScreen} absolute={absolute}>
    <Icon className="text-blue-500" icon="warning" />
    <Text className="text-sm ml-4">
      Oh no! We&#8216;ve lost the connection to your Xero account,
      <Button isLink isExternal className="text-blue-500 px-1 underline" state="text" variant="info" href="/xero-connect">
        reconnect Xero
      </Button>
      to show accurate data.
    </Text>
  </Banner>
));
