import React, { memo } from 'react';
import cn from 'classnames';

type Props = {
  className?: string;
  src: string;
};

const BASE_CLASSES = ['bg-cover', 'bg-no-repeat', 'bg-center'];

export const BackgroundImage = memo(({ className, src }: Props) => {
  const classes = cn(className, BASE_CLASSES);

  return <div className={classes} style={{ backgroundImage: `url(${src})` }} />;
});
