import React, { memo } from 'react';
import { generatePath } from 'react-router-dom';
import { ADMIN_ROUTES } from '@client/admin';
import { GqlOrganisationsByEmailQuery } from '@graphql';
import { Button, Td, Tr, Text } from '@client/common';

type Props = {
  organisation: GqlOrganisationsByEmailQuery['organisationsByEmail'][number];
};

export const AdminOrganisationRow = memo(({ organisation }: Props) => {
  const { id: orgId } = organisation;

  const route = generatePath(ADMIN_ROUTES.organisation, { orgId });

  const renderPrimaryUserName = (organisation: GqlOrganisationsByEmailQuery['organisationsByEmail'][number]) => {
    return organisation.primaryUser ? `${organisation.primaryUser.firstName} ${organisation.primaryUser.lastName}` : '–';
  };

  return (
    <Tr data-testid="flnc-admin-organisation-row table-fixed">
      <Td className="w-1/6">
        <Button href={route} state="text" variant="info" isLink>
          {organisation.name}
        </Button>
      </Td>
      <Td>
        <Text isBlock>{renderPrimaryUserName(organisation)}</Text>
      </Td>
    </Tr>
  );
});
