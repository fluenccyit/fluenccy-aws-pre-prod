import React, { memo } from 'react';
import cn from 'classnames';

type Props = {
  className?: string;
  hasCarat?: boolean;
};

const BASE_CLASSES = ['relative', 'border-b', 'border-gray-200', 'my-5'];
const CARAT_BASE_CLASSES = [
  'absolute',
  'bg-white',
  'border-solid',
  'border-gray-200',
  'border-b',
  'border-r',
  'transform',
  'rotate-45',
  'w-3',
  'h-3',
  'right-5',
];

export const CardSeparator = memo(({ className, hasCarat }: Props) => {
  const classes = cn(className, BASE_CLASSES);

  // The `-top-#` tailwind class didn't seem to be working, so resorted to using the `style` attr to position the carat.
  return <div className={classes}>{hasCarat && <div className={cn(CARAT_BASE_CLASSES)} style={{ top: -5 }} />}</div>;
});
