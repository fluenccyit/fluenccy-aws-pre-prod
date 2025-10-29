import React, { memo } from 'react';
import { Page, PageContent, Text } from '@client/common';
import { ChangePassword } from '@client/account';

export const ChangePasswordPage = () => {
  return (
    <Page>
      <PageContent className="min-h-screen" hasHeader={false} isCentered>
        <div className="text-center">
          <Text className="font-bold text-3xl mt-4" isBlock>
            Change Password
          </Text>
          <ChangePassword/>
        </div>
      </PageContent>
    </Page>
  );
};
