import React from 'react';
import cn from 'classnames';
import { Text } from '@client/common';
import { useQueryLocalOrganisation } from '@client/organisation';

type Props = {
  className?: string;
  variant?: 'dark' | 'light';
};

const BASE_CLASSES = ['inline-flex', 'flex-shrink-0', 'items-center', 'text-white', 'rounded-full', 'max-w-xs', 'px-4', 'py-2'];

export const HeaderOrganisation = ({ className, variant = 'light' }: Props) => {
  const { organisation } = useQueryLocalOrganisation();
  const classes = cn(className, BASE_CLASSES);

  if (!organisation?.name) {
    return null;
  }

  return (
    <div className={classes}>
      <Text className="text-sm whitespace-nowrap overflow-ellipsis overflow-hidden" variant={variant}>
        {organisation.name}
      </Text>
    </div>
  );
};
