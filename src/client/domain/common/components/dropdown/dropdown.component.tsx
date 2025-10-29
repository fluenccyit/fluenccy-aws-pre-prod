import React, { ReactNode, useRef, MutableRefObject, memo, useCallback, useEffect } from 'react';
import cn from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { Button, Header, Icon } from '@client/common';
import FluenccyLogoSvg from '@assets/svg/fluenccy-icon-logo.svg';

type Props = {
  children: ReactNode;
  className?: string;
  id?: string;
  isOpen?: boolean;
  isFullscreen?: boolean;
  onClickOutside?: () => void;
  onClose?: () => void;
  toggleRef?: MutableRefObject<any>;
};

const BASE_CLASSES = ['bg-white', 'z-dropdown'];

export const Dropdown = memo(({ id, children, className, isOpen, isFullscreen, onClickOutside, onClose, toggleRef }: Props) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const classes = cn(className, BASE_CLASSES, {
    'absolute rounded-md shadow-lg border border-gray-300': !isFullscreen,
    'fixed h-screen w-screen top-0 left-0 pt-14 md:pt-20 overflow-y-scroll scrollbar-hide': isFullscreen,
    visible: isOpen,
    hidden: !isOpen,
  });

  const handleClickOutside = useCallback(({ target }: MouseEvent | TouchEvent) => {
    if (!dropdownRef.current || dropdownRef.current.contains(target as any) || (toggleRef?.current && toggleRef.current.contains(target))) {
      return;
    }

    if (onClickOutside) {
      onClickOutside();
    }
  }, []);

  const handleKeydown = useCallback(({ code }: KeyboardEvent) => {
    if (code === 'Escape' && onClose) {
      onClose();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    window.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [dropdownRef, onClickOutside, toggleRef]);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = isOpen ? 'hidden' : 'visible';
    }

    return () => {
      document.body.style.overflow = 'visible';
    };
  }, [isOpen, isFullscreen]);

  return (
    <AnimatePresence>
      {isFullscreen && (
        <div id={id} className={classes} ref={dropdownRef} hidden={!isOpen}>
          <Header variant="light">
            <div className="flex items-center justify-between w-full">
              <FluenccyLogoSvg />
              {onClose && (
                <Button onClick={onClose} state="text">
                  <Icon className="text-gray-900" icon="close" />
                </Button>
              )}
            </div>
          </Header>
          <div className="overflow-y-scroll scrollbar-hide">{children}</div>
        </div>
      )}
      {!isFullscreen && isOpen && (
        <motion.div
          id={id}
          className={classes}
          ref={dropdownRef}
          hidden={!isOpen}
          initial={{ y: -5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
          exit={{ y: -5, opacity: 0 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
});
