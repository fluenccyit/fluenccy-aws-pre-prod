import React, { ChangeEvent, memo, useEffect, useState } from 'react';
import { map } from 'lodash';
import { useHistory } from 'react-router-dom';
import { AUTH_ROUTES } from '@client/auth';
import { GqlOrganisationsByEmailQuery, GqlUser, Maybe } from '@graphql';
import { queryOrganisations } from '@client/organisation';
import { AdminOrganisationRow, AdminErrorPage } from '@client/admin';
import {
  APOLLO_ERROR_MESSAGE,
  Input,
  Label,
  loggerService,
  Page,
  PageContent,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  TextSkeleton,
  Th,
  Thead,
  Tr,
  uiVar,
  useQueryLocalCommon,
} from '@client/common';
import { useMemo } from 'react';

type Organisation = GqlOrganisationsByEmailQuery['organisationsByEmail'][number];

export const AdminOrganisationsPage = memo(() => {
  const history = useHistory();
  const { ui } = useQueryLocalCommon();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [organisations, setOrganisations] = useState<Organisation[]>();
  const [organisationsMatchingSearch, setOrganisationsMatchingSearch] = useState<Organisation[]>();
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | 0>();
  const isSavingOrLoading = useMemo(() => isSaving || ui === 'loading', [isSaving, ui]);

  useEffect(() => {
    (async () => {
      try {
        uiVar('loading');
        const organisations = await queryOrganisations();
        setOrganisations(organisations);
        setOrganisationsMatchingSearch(organisations);
        uiVar('ready');
      } catch (error) {
        if (error.message === APOLLO_ERROR_MESSAGE.authenticationFailed) {
          history.push(AUTH_ROUTES.login);
        } else {
          loggerService.error(error);
          uiVar('error');
        }
      }
    })();
  }, []);

  const performSearch = (searchTerm: string) => {
    const getFullName = (primaryUser: Maybe<Pick<GqlUser, 'firstName' | 'lastName'>>) => {
      return `${primaryUser?.firstName.toLowerCase()} ${primaryUser?.lastName.toLowerCase()}`;
    };

    const searchTermLowerCase = searchTerm.toLowerCase();

    try {
      if (!organisations) {
        return;
      }
      const matches: Organisation[] = organisations.filter((org) => {
        const matchesOrgName = org.name.toLowerCase().includes(searchTermLowerCase);
        const matchesPrimaryUserName = getFullName(org.primaryUser).includes(searchTermLowerCase);
        return Boolean(matchesOrgName || matchesPrimaryUserName);
      });

      setOrganisationsMatchingSearch(matches);
      setIsSaving(false);
    } catch (error) {
      if (error.message === APOLLO_ERROR_MESSAGE.authenticationFailed) {
        history.push(AUTH_ROUTES.login);
      } else {
        loggerService.error(error);
        uiVar('error');
      }
    }
  };

  const handleSearch = ({ target }: ChangeEvent<HTMLInputElement>) => {
    const searchTerm = target.value;
    setSearchTerm(searchTerm);

    setIsSaving(true);
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    const newTimeout = setTimeout(() => performSearch(searchTerm), 400); // Only do the search if user has stopped typing for 400ms
    setSearchTimeout(newTimeout);
  };

  if (ui === 'error') {
    return <AdminErrorPage />;
  }

  const renderContent = () => {
    return (
      <TableContainer>
        <Table>
          <Thead>
            <Th>{isSavingOrLoading ? <TextSkeleton className="my-0.5 w-32 h-3" /> : 'Organisation Name'}</Th>
            <Th>{isSavingOrLoading ? <TextSkeleton className="my-0.5 w-32 h-3" /> : 'Primary User'}</Th>
          </Thead>
          <Tbody>
            {isSavingOrLoading &&
              [...Array(organisationsMatchingSearch?.length || 1)].map((e, i) => (
                <Tr key={i}>
                  <Td>
                    <TextSkeleton className="my-0.5 w-32 h-3" />
                  </Td>
                  <Td>
                    <TextSkeleton className="my-0.5 w-32 h-3" />
                  </Td>
                </Tr>
              ))}
            {!isSavingOrLoading && !organisationsMatchingSearch?.length && (
              <Tr>
                <Td colSpan={2}>
                  <div className="w-full flex justify-center">
                    <Text className="text-med">No results</Text>
                  </div>
                </Td>
              </Tr>
            )}
            {!isSavingOrLoading &&
              map(organisationsMatchingSearch, (organisation) => <AdminOrganisationRow key={organisation.id} organisation={organisation} />)}
          </Tbody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Page>
      <PageContent>
        <Label>Filter organisations</Label>
        <Input
          className="max-w-lg mb-4"
          value={searchTerm}
          onChange={handleSearch}
          onFocus={({ target }) => target.select()}
          isRequired
          autoFocus
          isDisabled={ui === 'loading'}
        />
        {renderContent()}
      </PageContent>
    </Page>
  );
});
