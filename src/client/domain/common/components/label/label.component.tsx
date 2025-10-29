import React, { ReactNode } from 'react';
import cn from 'classnames';
import { Text } from '@client/common';

type Props = {
  className?: string;
  children: ReactNode;
};

const BASE_CLASSES = ['text-sm', 'text-left', 'mb-1'];

export const Label = ({ className, children }: Props) => {
  const classes = cn(className, BASE_CLASSES);

  return (
    <Text className={classes} isBlock>
      {children}
    </Text>
  );
};
