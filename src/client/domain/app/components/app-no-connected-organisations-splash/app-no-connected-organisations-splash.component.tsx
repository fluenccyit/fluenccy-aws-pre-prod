import React, { memo } from 'react';
import { ONBOARDING_ROUTES } from '@client/onboarding';
import { Button, Page, PageContent, Text, TheHeader } from '@client/common';
import NoConnectedOrganisationsSvg from '@assets/svg/no-connected-organisations.svg';

export const AppNoConnectedOrganisationsSplash = memo(() => (
  <Page>
    <TheHeader hasNoNavLinks />
    <PageContent className="min-h-screen" isCentered>
      <div className="flex flex-col items-center">
        <NoConnectedOrganisationsSvg />
        <Text className="font-bold text-2xl text-center mt-8" isBlock>
          You don&apos;t have any Xero organisations connected
        </Text>

        <Button className="mt-8" variant="success" href={ONBOARDING_ROUTES.root} isLink isRounded>
          Connect Xero
        </Button>
      </div>
    </PageContent>
  </Page>
));
