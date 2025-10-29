import { RefObject, useEffect, useState } from 'react';
import { max } from 'lodash';

export const useGetWidth = (ref: RefObject<HTMLDivElement>, defaultWidth = 1000) => {
  const [width, setWidth] = useState(defaultWidth);

  const getWidth = () => {
    return max([defaultWidth, ref?.current?.getBoundingClientRect().width]) as number;
  };

  const handleResize = () => {
    setWidth(getWidth());
  };

  useEffect(() => {
    setWidth(getWidth());

    window.addEventListener('resize', handleResize, true);
    return () => {
      window.removeEventListener('resize', handleResize, true);
    };
  }, []);

  return width;
};
