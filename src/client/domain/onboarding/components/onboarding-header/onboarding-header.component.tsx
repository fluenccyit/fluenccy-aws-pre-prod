import React, { ReactNode, memo } from 'react';
import { Header, TheHeaderActions } from '@client/common';
import FluenccyLogoSvg from '@assets/svg/fluenccy-logo.svg';
import FluenccyIconLogoSvg from '@assets/svg/fluenccy-icon-logo.svg';
import { useQueryLocalOrganisation } from '@client/organisation';

type Props = {
  children?: ReactNode;
};

export const OnboardingHeader = memo(({ children }: Props) => {
  const { organisation } = useQueryLocalOrganisation();

  return (
    <Header variant="light">
      <div className="flex items-center justify-between w-full">
        <div className="md:w-3/12">
          <FluenccyLogoSvg className="hidden md:block" />
          <FluenccyIconLogoSvg className="block md:hidden" />
        </div>
        {children}
        {organisation && <TheHeaderActions variant="dark" />}
      </div>
    </Header>
  );
});
