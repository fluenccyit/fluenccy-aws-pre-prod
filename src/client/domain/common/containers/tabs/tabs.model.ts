import { ReactNode } from 'react';

export type TabModel<T = string> = {
  id: T;
  label: ReactNode;
};
