import React, { memo } from 'react';
import cn from 'classnames';
import { useQueryLocalOrganisation } from '@client/organisation';
import { Text, TextSkeleton, useQueryLocalCommon } from '@client/common';

const BASE_CLASSES = ['flex', 'items-center', 'border-r', 'border-gray-200', 'px-6', 'min-w-organisation-breakdown', 'max-w-organisation-breakdown'];

export const AdminOrganisationControlsLeft = memo(() => {
  const { organisation: localOrganisation } = useQueryLocalOrganisation();
  const { ui } = useQueryLocalCommon();

  return (
    <div className={cn(BASE_CLASSES)}>
      <div className="flex items-baseline w-full" data-testid="flnc-admin-organisation-view-name">
        {ui === 'error' && <TextSkeleton className="w-full h-6" isLoading={false} />}
        {ui === 'loading' && <TextSkeleton className="w-full h-6" />}
        {ui === 'ready' && (
          <>
            <Text className="text-l font-bold">{localOrganisation?.name}</Text>
            <Text className="text-xs ml-2">({localOrganisation?.currency})</Text>
          </>
        )}
      </div>
    </div>
  );
});
