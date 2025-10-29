import React from 'react';
import cn from 'classnames';
import { indexOf, map } from 'lodash';
import { Text } from '@client/common';
import { ONBOARDING_STEP_LABELS, OnboardingStepLabelType, OnboardingStepSeparator, OnboardingStepItem } from '@client/onboarding';
import { useAuth } from '@client/auth';
import { useQueryLocalOrganisation } from '@client/organisation';

type Props = {
  activeLabel: OnboardingStepLabelType;
};

const BASE_CLASSES = ['flex', 'items-center', 'lg:w-8/12', 'lg:justify-end'];

export const OnboardingSteps = ({ activeLabel }: Props) => {
  const { organisation } = useQueryLocalOrganisation();
  const { xeroSelected } = useAuth();
  const isStepComplete = (label: OnboardingStepLabelType) => {
    return indexOf(ONBOARDING_STEP_LABELS, activeLabel) > indexOf(ONBOARDING_STEP_LABELS, label);
  };

  const stepLabels = organisation
    ? organisation?.tenant.id.includes('tenant_')
      ? ONBOARDING_STEP_LABELS.filter((l) => !l.includes('Xero'))
      : ONBOARDING_STEP_LABELS.filter((l) => !l.includes('Import Csv'))
    : xeroSelected
    ? ONBOARDING_STEP_LABELS.filter((l) => !l.includes('Import Csv'))
    : ONBOARDING_STEP_LABELS.filter((l) => !l.includes('Xero'));
  return (
    <div className={cn(BASE_CLASSES)}>
      {map(stepLabels, (label, index) => {
        const isComplete = isStepComplete(label);

        return (
          <div className="flex items-center" key={index}>
            {Boolean(index) && <OnboardingStepSeparator isComplete={isComplete} />}
            <OnboardingStepItem isComplete={isComplete} isActive={label === activeLabel} label={label} />
          </div>
        );
      })}
      <Text className="text-sm ml-2 lg:hidden">{activeLabel}</Text>
    </div>
  );
};
