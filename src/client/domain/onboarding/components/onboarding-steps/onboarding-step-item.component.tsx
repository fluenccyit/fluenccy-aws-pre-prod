import React from 'react';
import cn from 'classnames';
import { Icon } from '@client/common';
import { OnboardingStepLabelType } from '@client/onboarding';

type Props = {
  label: OnboardingStepLabelType;
  isComplete?: boolean;
  isActive?: boolean;
};

const BASE_CLASSES = ['flex', 'items-center', 'justify-center', 'text-sm'];
const BASE_CONTENT_CLASSES = ['h-3.5', 'w-3.5', 'rounded-full', 'flex', 'items-center', 'justify-center', 'md:h-4.5', 'md:w-4.5'];

export const OnboardingStepItem = ({ label, isActive, isComplete }: Props) => {
  const classes = cn(BASE_CLASSES, {
    'text-gray-900': isComplete,
    'text-gray-450': !isComplete,
    'font-normal': !isActive && !isComplete,
  });
  const contentClasses = cn(BASE_CONTENT_CLASSES, {
    'bg-green-500': isComplete,
    'bg-white border-2 md:border-4': !isComplete,
    'border-gray-400': !isActive,
    'border-green-500': isActive,
  });

  return (
    <div className={classes}>
      <div className={contentClasses}>{isComplete && <Icon className="text-white" icon="tick" />}</div>
      <div className="hidden lg:flex ml-2">{label}</div>
    </div>
  );
};
