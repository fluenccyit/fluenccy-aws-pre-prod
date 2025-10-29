import React, { memo } from 'react';
import { Page, PageContent, Text } from '@client/common';
import { Profile } from "@client/account";

export const ProfilePage = memo(() => {
  return (
    <Page variant="gray">
      <PageContent className="flex h-screen justify-center " hasPadding={false}>
        <div className="text-center">
          <Text className="text-2xl mb-6 mt-5 md:mt-7" isBlock>
            Update Profile
          </Text>
          <Profile />
        </div>
      </PageContent>
    </Page>
  );
});
