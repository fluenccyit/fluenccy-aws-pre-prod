import React, { useState, useRef } from 'react';
import cn from 'classnames';
import { SHARED_XERO_ROUTES } from '@shared/xero';
import XeroLogoInverseSvg from '@assets/svg/xero-logo-inverse.svg';
import { useAnalytics, Text, Button, useQueryLocalCommon, uiVar, Checkbox, EXTERNAL_LINK } from '@client/common';

type Props = {
  className?: string;
};

const BASE_CLASSES = ['w-full', 'px-5', 'pb-5', 'overflow-y-scroll', 'lg:px-20', 'md:w-onboarding-form', 'lg:min-w-onboarding-form'];

export const OnboardingConnectXeroForm = ({ className }: Props) => {
  const tAndCCheckbox = useRef<HTMLInputElement>(null);
  const classes = cn(className, BASE_CLASSES);
  const { track } = useAnalytics();
  const { ui } = useQueryLocalCommon();
  const [isTAndCChecked, setIsTAndCsChecked] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const handleTAndCClick = () => {
    setShowValidation(false);
    setIsTAndCsChecked(!isTAndCChecked);
  };

  const handleConnectClick = async () => {
    if (isTAndCChecked) {
      uiVar('saving');
      await track('onboarding_connectxero_primary');
      window.location.href = SHARED_XERO_ROUTES.connect;
    } else {
      setShowValidation(true);
      tAndCCheckbox.current?.focus();
    }
  };

  return (
    <div className={classes}>
      <Text className="text-2xl mt-5 md:mt-7" isBlock>
        To see your currency performance sign up and connect your Xero account
      </Text>

      <Button className="w-full my-3 h-12 rounded-full" variant="xero-blue" onClick={handleConnectClick} isDisabled={ui === 'saving'}>
        Connect to
        <XeroLogoInverseSvg className="ml-2" />
      </Button>

      {showValidation && (
        <Text className="text-xs" isBlock>
          Required
        </Text>
      )}

      <label htmlFor="flnc-t-and-c-checkbox" className="flex flex-row cursor-pointer mt-3">
        <Checkbox
          ref={tAndCCheckbox}
          id="flnc-t-and-c-checkbox"
          className="mr-2"
          onChange={handleTAndCClick}
          isChecked={isTAndCChecked}
          isDisabled={ui === 'saving'}
        />
        <Text className="text-sm" variant="gray">
          By checking this box I agree to{' '}
          <Button state="text" variant="info" href={EXTERNAL_LINK.licenceAgreement} isDisabled={ui === 'saving'} isOpenedInNewTab isLink isExternal>
            Fluenccy&apos;s T&amp;Cs
          </Button>{' '}
          and that I have the consent of the Xero account owner to authorise with Fluenccy
        </Text>
      </label>
    </div>
  );
};
