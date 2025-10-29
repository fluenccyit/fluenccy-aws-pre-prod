import { AdminOrganisationControlsLeft, AdminOrganisationControlsRight } from '@client/admin';
import React, { memo } from 'react';
import cn from 'classnames';

export const AdminOrganisationControls = memo(() => {
  const BASE_CLASSES = ['absolute', 'flex', 'bg-white', 'border-b', 'border-gray-300', 'shadow-md', 'w-full', 'h-17'];

  return (
    <div className={cn(BASE_CLASSES)}>
      <AdminOrganisationControlsLeft />
      <AdminOrganisationControlsRight />
    </div>
  );
});
