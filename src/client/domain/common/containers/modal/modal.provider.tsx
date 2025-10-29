import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { Modal } from '@client/common';
export type ModalContextType = {
  closeModal: () => void;
  modal: ReactNode;
  openModal: (modal: ReactNode) => void;
  setWidth: (width: string) => void;
  width: string;
};
export const ModalContext = createContext<ModalContextType | null>(null);
export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modal, setModal] = useState<ModalContextType['modal']>(null);
  const [width, setWidth] = useState<string>('auto');
  const value = useMemo(
    () => ({
      closeModal: () => {
        setModal(null);
        setWidth('auto');
      },
      modal,
      width,
      openModal: (modal: ReactNode) => setModal(modal),
      setWidth: (width: string) => setWidth(width)
    }),
    [modal]
  );
  return (
    <ModalContext.Provider value={value}>
      {children}
      <Modal />
    </ModalContext.Provider>
  );
};
export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('This component must be used within a <ModalProvider> component.');
  }
  return context;
};
