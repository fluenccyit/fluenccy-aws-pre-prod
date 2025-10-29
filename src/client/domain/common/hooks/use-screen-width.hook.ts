import { useEffect, useState, useMemo } from 'react';
import { inRange } from 'lodash';
import { TAILWIND_SCREEN_SM, TAILWIND_SCREEN_LG, TAILWIND_SCREEN_MD, TAILWIND_SCREEN_XL } from '@client/common';

export const useWindowWidth = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth || 0);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const tailwindBreakpoint = useMemo(() => {
    if (inRange(windowWidth, 0, TAILWIND_SCREEN_SM)) {
      return 'sm';
    } else if (inRange(windowWidth, TAILWIND_SCREEN_SM, TAILWIND_SCREEN_MD)) {
      return 'md';
    } else if (inRange(windowWidth, TAILWIND_SCREEN_MD, TAILWIND_SCREEN_LG)) {
      return 'lg';
    } else if (inRange(windowWidth, TAILWIND_SCREEN_LG, TAILWIND_SCREEN_XL)) {
      return 'xl';
    } else {
      return '2xl';
    }
  }, [windowWidth]);

  return { windowWidth, tailwindBreakpoint };
};
