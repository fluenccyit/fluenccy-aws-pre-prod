import React, { memo, useMemo, useRef, useEffect, useState } from 'react';
import cn from 'classnames';
import { find, map } from 'lodash';
import { useIntercom } from 'react-use-intercom';
import { PLAN_ROUTES } from '@client/plan';
import XeroLogoSvg from '@assets/svg/xero-logo.svg';
import { DASHBOARD_ROUTES } from '@client/dashboard';
import { useQueryLocalAccount } from '@client/account';
import { useQueryLocalUser, userService } from '@client/user';
import { CURRENCY_SCORE_ROUTES } from '@client/currency-score';
import XeroLogoInverseSvg from '@assets/svg/xero-logo-inverse.svg';
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  DropdownContent,
  EXTERNAL_LINK,
  HeaderOrganisation,
  Icon,
  localStorageService,
  Select,
  TAILWIND_SCREEN_MD,
  Text,
  ToastGenericError,
  uiVar,
  useQueryLocalCommon,
  useToast,
  useWindowWidth,
} from '@client/common';
import {
  LocalOrganisationType,
  organisationsVar,
  organisationVar,
  ORGANISATION_ROUTES,
  queryOrganisationsByToken,
  useMutationOrganisation,
  useQueryLocalOrganisation,
} from '@client/organisation';

import { chartCurrencyVar } from '@client/chart';
import { NavLink } from 'react-router-dom';

type Props = {
  variant?: 'dark' | 'light';
  hasNoNavLinks?: boolean;
};

export const TheHeaderActions = memo(({ variant = 'light', hasNoNavLinks }: Props) => {
  const { addToast } = useToast();
  const { ui } = useQueryLocalCommon();
  const { user } = useQueryLocalUser();
  const { windowWidth } = useWindowWidth();
  const { account } = useQueryLocalAccount();
  const { show: showIntercom } = useIntercom();
  const { deleteOrganisation } = useMutationOrganisation();
  const { organisation, organisations } = useQueryLocalOrganisation();
  const [isOpen, setIsOpen] = useState(false);
  const avatarRef = useRef<HTMLButtonElement>(null);
  const isMobile = useMemo(() => windowWidth <= TAILWIND_SCREEN_MD, [windowWidth]);
  const organisationOptions = useMemo(() => map(organisations, ({ name: label, id: value }) => ({ label, value })), [account]);

  if (!user || !account || !organisation) {
    return null;
  }

  const handleOrganisationChange = (id: string) => {
    localStorageService.setItem('selected-organisation-id', id);
    const selectedOrg = find(organisations, { id });
    organisationVar(selectedOrg);
    chartCurrencyVar(selectedOrg?.tradeCurrencies[0]);
    setSelected(id);
    setIsOpen(false);
  };

  const handleDisconnectClick = async () => {
    if (!organisation?.id) {
      return;
    }

    try {
      uiVar('saving');
      await deleteOrganisation({ variables: { input: { orgId: organisation.id } } });
      const organisations = await queryOrganisationsByToken();

      organisationsVar(organisations as LocalOrganisationType[]);

      if (!organisations.length) {
        organisationVar(null);
        return;
      }

      organisationVar(organisations[0] as LocalOrganisationType);
      uiVar('ready');
    } catch {
      addToast(<ToastGenericError />, 'danger');
      uiVar('ready');
    }
  };

  const dropdownClasses = cn('w-80', {
    ['right-0 top-12 overflow-hidden']: !isMobile,
  });

  const [selected, setSelected] = useState(undefined);

  useEffect((id: string) => {
    setSelected(id);
  }, []);

  const isConnectedToXero = !organisation.tenant.id.includes('tenant_');

  return (
    <section className="relative flex items-center justify-end md:w-3/12">
      <HeaderOrganisation variant={variant} />
      <Avatar onClick={() => setIsOpen(!isOpen)} ref={avatarRef} size={isMobile ? 'sm' : 'md'}>
        {userService.getInitials(user)}
      </Avatar>
      <Dropdown
        className={dropdownClasses}
        onClickOutside={() => setIsOpen(false)}
        onClose={() => setIsOpen(false)}
        toggleRef={avatarRef}
        isOpen={isOpen}
        isFullscreen={isMobile}
      >
        <DropdownContent to="/account" isDisabled={ui === 'saving'} className="hover:bg-gray-100">
          <Text className="flex items-center" isBlock>
            <Icon className="text-gray-450 mr-3.5" icon="account" />
            My Account
          </Text>
        </DropdownContent>
        <DropdownContent to="/account/change-password" isDisabled={ui === 'saving'} className="hover:bg-gray-100">
          <Text className="flex items-center" isBlock>
            <Icon className="text-gray-450 mr-3.5" icon="password" style={{ fill: '#cccccc' }} />
            Change Password
          </Text>
        </DropdownContent>
        {isMobile && !hasNoNavLinks && (
          <>
            <DropdownContent className="pr-10" to={DASHBOARD_ROUTES.root} onClick={() => setIsOpen(false)}>
              <Text className="flex items-center" isBlock>
                Dashboard
              </Text>
              <Icon className="text-gray-450 absolute right-6 top-1/2 transform -translate-y-1/2" icon="carat-right" />
            </DropdownContent>

            <DropdownContent className="pr-10" to={CURRENCY_SCORE_ROUTES.root} onClick={() => setIsOpen(false)}>
              <Text className="flex items-center" isBlock>
                Currency Score
              </Text>
              <Icon className="text-gray-450 absolute right-6 top-1/2 transform -translate-y-1/2" icon="carat-right" />
            </DropdownContent>
            {/* <DropdownContent className="pr-10" to={EXTERNAL_LINK.coaching} isExternal>
              <Text className="flex items-center" isBlock>
                Coaching
              </Text>
              <Text className="text-sm mt-2" variant="gray" isBlock>
                Insights and actionable advice to help your business manage it&apos;s foreign currency.
              </Text>
              <Icon className="text-gray-450 absolute right-6 top-1/2 transform -translate-y-1/2" icon="carat-right" />
            </DropdownContent> */}
            <DropdownContent className="pr-10" to={PLAN_ROUTES.root} onClick={() => setIsOpen(false)}>
              <Text className="flex items-center" isBlock>
                Plan
              </Text>
              <Icon className="text-gray-450 absolute right-6 top-1/2 transform -translate-y-1/2" icon="carat-right" />
            </DropdownContent>
          </>
        )}
        {organisationOptions.length > 1 && (
          <DropdownContent>
            {user.role !== 'superdealer' ? (
              <>
                <Text className="flex items-center" isBlock>
                  <Icon className="text-gray-450 mr-3.5" icon="org" /> Switch Organisation
                </Text>
                <Select
                  className="mt-2"
                  options={organisationOptions}
                  onChange={handleOrganisationChange}
                  value={organisation.id}
                  isDisabled={ui === 'saving'}
                  selected={selected ? selected : organisation?.id}
                />
              </>
            ) : (
              <NavLink to={ORGANISATION_ROUTES.root}>
                <Icon className="text-gray-450 mr-3.5" icon="org" /> Switch Organisation
              </NavLink>
            )}
          </DropdownContent>
        )}
        {isConnectedToXero && (
          <DropdownContent>
            {organisation.tokenStatus === 'active' && (
              <Button className="w-full mb-2 text-xero-blue" variant="gray" onClick={handleDisconnectClick} isDisabled={ui === 'saving'}>
                <XeroLogoSvg className="mr-2" />
                Disconnect from Xero
              </Button>
            )}

            {organisation.tokenStatus !== 'active' && (
              <Button className="w-full mb-2" variant="xero-blue" href="/xero-connect" isDisabled={ui === 'saving'} isLink isExternal>
                Reconnect
                <XeroLogoInverseSvg className="ml-2" />
              </Button>
            )}

            <Button className="w-full" variant="xero-blue" state="outline" href="/xero-connect" isDisabled={ui === 'saving'} isLink isExternal>
              <Icon className="text-xero-blue mr-2" icon="add-circle-filled" />
              Add another organisation
            </Button>
          </DropdownContent>
        )}
        <DropdownContent to="/logout" isDisabled={ui === 'saving'} className="hover:bg-gray-100">
          <div className="flex items-center">
            <Icon className="text-gray-450 mr-3.5" icon="logout" />
            <Text className="font-medium text-gray-550">Log out</Text>
          </div>
        </DropdownContent>
      </Dropdown>
    </section>
  );
});
