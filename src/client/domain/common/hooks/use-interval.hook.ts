import { useEffect, useRef } from 'react';

type CallbackParam = () => void;

export const useInterval = (callback: CallbackParam, timeout: number | null) => {
  const callbackRef = useRef<CallbackParam>();

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (timeout) {
      const id = setInterval(() => {
        callbackRef.current && callbackRef.current();
      }, timeout);

      return () => clearInterval(id);
    }
  }, [timeout]);
};
