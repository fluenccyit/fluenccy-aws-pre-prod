import React from 'react';
import cn from 'classnames';

type Props = {
  isComplete?: boolean;
};

const BASE_CLASSES = ['h-0.5', 'w-8', 'mx-0.5', 'mt-0', 'lg:mx-4', 'lg:mt-1', 'xl:w-24'];

export const OnboardingStepSeparator = ({ isComplete }: Props) => {
  const classes = cn(BASE_CLASSES, {
    'bg-green-500': isComplete,
    'bg-gray-400': !isComplete,
  });

  return <div className={classes} />;
};
