import React, { memo, ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import cn from 'classnames';
import { Icon } from '@client/common';

type Props = {
  children: ReactNode;
  className?: string;
  buttonClassName?: string;
  label: ReactNode;
  onClick?: (isOpen: boolean) => void;
  isOpenInitialValue?: boolean;
};

const BASE_BUTTON_CLASSES = ['text-left', 'flex', 'w-full', 'flex-row', 'justify-between', 'items-center', 'focus:outline-none'];

export const Accordion = memo(({ children, className, buttonClassName, label, onClick, isOpenInitialValue }: Props) => {
  const buttonClasses = cn(buttonClassName, BASE_BUTTON_CLASSES);
  const [isOpen, setIsOpen] = useState(isOpenInitialValue);

  const handleClick = () => {
    setIsOpen(!isOpen);
    onClick && onClick(!isOpen);
  };

  return (
    <div className={className}>
      <button className={buttonClasses} onClick={handleClick}>
        <div>{label}</div>
        <Icon className="text-gray-500" icon={isOpen ? 'carat-up' : 'carat-down'} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            transition={{ duration: 0.5 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
