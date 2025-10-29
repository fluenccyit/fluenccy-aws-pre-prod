import React, { memo, useRef, useState } from 'react';
import { ADMIN_ROUTES } from '@client/admin';
import { useQueryLocalUser, userService } from '@client/user';
import FluenccyLogoSvg from '@assets/svg/fluenccy-logo.svg';
import FluenccyIconLogoSvg from '@assets/svg/fluenccy-icon-logo.svg';
import { Avatar, Dropdown, DropdownContent, Header, HeaderNavLink, Icon, Text } from '@client/common';

export const AdminHeader = memo(() => {
  const avatarRef = useRef<HTMLButtonElement>(null);
  const { user } = useQueryLocalUser();
  const [isOpen, setIsOpen] = useState(false);
  const activeOrganisationUrls = [ADMIN_ROUTES.organisation, ADMIN_ROUTES.organisations];

  if (!user) {
    return null;
  }

  return (
    <Header variant="light">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          <HeaderNavLink className="whitespace-nowrap" to={ADMIN_ROUTES.root} hasActiveState={false}>
            <FluenccyLogoSvg className="hidden md:block" />
            <FluenccyIconLogoSvg className="block md:hidden" />
          </HeaderNavLink>
          <HeaderNavLink className="ml-12" to={ADMIN_ROUTES.organisations} variant="dark" activeRoutes={activeOrganisationUrls}>
            Organisations
          </HeaderNavLink>
          <HeaderNavLink className="ml-12" to={ADMIN_ROUTES.invite} variant="dark">
            Invites
          </HeaderNavLink>
        </div>
        <section className="flex flex-row justify-end w-full">
          <Avatar onClick={() => setIsOpen(!isOpen)} ref={avatarRef}>
            {userService.getInitials(user)}
          </Avatar>
          <Dropdown className="right-6 top-14" isOpen={isOpen} onClickOutside={() => setIsOpen(false)} toggleRef={avatarRef}>
            <DropdownContent to="/logout" className="hover:bg-gray-100">
              <div className="flex items-center">
                <Icon className="text-gray-450 mr-3.5" icon="logout" />
                <Text className="font-medium text-gray-550">Log out</Text>
              </div>
            </DropdownContent>
          </Dropdown>
        </section>
      </div>
    </Header>
  );
});
