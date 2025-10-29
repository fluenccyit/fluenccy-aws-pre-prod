import React from 'react';
import { Text } from '@client/common';

export const ToastGenericError = () => (
  <>
    <Text isBlock>Oh no, something went wrong!</Text>
    <Text className="text-sm" variant="gray" isBlock>
      Try refreshing the page...
    </Text>
  </>
);
