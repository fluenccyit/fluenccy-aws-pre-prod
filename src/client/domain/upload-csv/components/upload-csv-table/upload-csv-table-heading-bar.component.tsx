import React, { memo } from 'react';
import cn from 'classnames';
import { Icon, Text } from '@client/common';

export const UploadCSVTableHeadingBar = memo(() => {

  return (
    <div className="flex flex-row items-end h-9 w-full">
      <Text isBlock className={cn('text-lg flex flex-row items-end')}>
        Import Data Logs
      </Text>
    </div>
  );
});
