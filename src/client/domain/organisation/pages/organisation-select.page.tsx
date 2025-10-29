import React, { memo, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { chartCurrencyVar } from '@client/chart';
import { Page, PageContent, useQueryLocalCommon, DropdownContent, Select, Text, localStorageService, Button } from '@client/common';
import { organisationVar, useQueryLocalOrganisation } from '@client/organisation';
import { find, map } from 'lodash';
import { useQueryLocalUser } from '@client/user';
import { DASHBOARD_ROUTES } from '../../dashboard/dashboard.routes';
import FluenccyLogoSvg from '@assets/svg/fluenccy-logo.svg';

export const OrganisationSelectPage = memo(() => {
  const history = useHistory();
  const { ui } = useQueryLocalCommon();
  const { organisation, organisations } = useQueryLocalOrganisation();
  const organisationOptions = useMemo(() => map(organisations, ({ name: label, id: value }) => ({ label, value })), []);

  const { user } = useQueryLocalUser();
  if (user?.role !== 'superdealer') {
    return history.push(DASHBOARD_ROUTES.root);
  }

  const goToDashboard = () => {
    localStorageService.setItem('selected-organisation-id-by-superdealer', "true");
    window.location.href = DASHBOARD_ROUTES.root;
  }

  const handleOrganisationChange = (id: string) => {
    localStorageService.setItem('selected-organisation-id', id);
    const selectedOrg = find(organisations, { id });
    organisationVar(selectedOrg);
    chartCurrencyVar(selectedOrg?.tradeCurrencies[0]);
  };

  return (
    <Page variant="light">
      <PageContent className="flex h-screen" isCentered hasPadding={false}>
        <div className="w-full sm:w-96 text-center">
          <FluenccyLogoSvg className="mx-auto" />
          <Text className="font-bold text-lg sm:text-3xl mt-4" isBlock>
            Select Organisation
          </Text>
          <DropdownContent>
            <Select
              className="mt-2"
              options={organisationOptions}
              onChange={handleOrganisationChange}
              value={organisation?.id}
              isDisabled={ui === 'saving'}
              selected={organisation?.id}
            />
            <Button className="w-full rounded-full mt-4" variant="xero-blue" onClick={goToDashboard}>
              Proceed
            </Button>
          </DropdownContent>
        </div>
      </PageContent>
    </Page>
  );
});
