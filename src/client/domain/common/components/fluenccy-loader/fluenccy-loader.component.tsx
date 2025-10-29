import React, { memo } from 'react';
import cn from 'classnames';
import { LottieOptions, useLottie } from 'lottie-react';
import animationDataSuccess from './fluenccy-loader-success.lottie.json';
import animationDataGray from './fluenccy-loader-gray.lottie.json';

type Props = Omit<LottieOptions, 'animationData'> & {
  className?: string;
  variant?: 'success' | 'gray';
};

const BASE_CLASSES = ['inline-block'];

export const FluenccyLoader = memo(({ className, variant = 'success', loop = true, autoplay = true, style = {} }: Props) => {
  const classes = cn(className, BASE_CLASSES);
  const { View } = useLottie({
    animationData: variant === 'success' ? animationDataSuccess : animationDataGray,
    loop,
    autoplay,
  });

  return <div className={classes} style={style}>{View}</div>;
});
