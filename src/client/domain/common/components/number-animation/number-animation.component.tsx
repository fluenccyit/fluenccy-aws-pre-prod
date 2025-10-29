import React, { memo, useEffect, useRef, useState } from 'react';
import { animate, AnimationPlaybackControls } from 'framer-motion';

type Props = {
  value: number;
  format?: (value: number) => string;
  isAnimatedInitially?: boolean;
  style?: object
};

export const NumberAnimation = memo(({ value = 0, format, isAnimatedInitially = true, style = {} }: Props) => {
  const divRef = useRef<HTMLDivElement>(null);
  const oldValueRef = useRef<number>(0);
  const [isInitialised, setIsInitialised] = useState(isAnimatedInitially);

  useEffect(() => {
    let controls: AnimationPlaybackControls | undefined;

    if (isAnimatedInitially || isInitialised) {
      controls = animate(oldValueRef.current, value, {
        duration: 0.3,
        onUpdate(value: number) {
          if (divRef.current) {
            divRef.current.textContent = format ? format(value) : value.toFixed(0).toString();
          }
        },
        onComplete() {
          oldValueRef.current = value;
        },
      });
    } else {
      if (divRef.current) {
        divRef.current.textContent = format ? format(value) : value.toFixed(0).toString();
      }
    }

    setIsInitialised(true);

    return () => controls?.stop();
  }, [value]);

  return <span ref={divRef} style={style}/>;
});
