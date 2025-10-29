import React, { memo } from 'react';
import { Banner, Icon, Text } from '@client/common';
import { useQueryLocalUser, userService } from '@client/user';

type Props = {
  isFullScreen?: boolean;
};

const TEXT_BY_ROLES = {
  superdealer: 'super dealer'
};

export const UserLoginBanner = memo(({ isFullScreen }: Props) => {
  const { user } = useQueryLocalUser();
  const {role, firstName, lastName} = user;

  return (
    <Banner variant="danger" isFullScreen={isFullScreen} absolute={false}>
      <Icon className="text-blue-500" icon="warning" />
      <Text className="text-sm ml-4">
        You are logged in as a {TEXT_BY_ROLES[role]} - {userService.getFullName({firstName, lastName})}
      </Text>
    </Banner>
  );
});
