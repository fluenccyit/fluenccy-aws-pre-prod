import React, { useMemo } from 'react';
import cn from 'classnames';
import { map } from 'lodash';
import { motion } from 'framer-motion';
import { Text, Icon } from "@client/common";

type Props = {
  className?: string;
  separatorClassName?: string;
  total: number;
  completed: number;
  isLoading?: boolean;
  title?: string | number;
};

const BASE_CLASSES = ['relative', 'bg-gray-450', 'rounded-full', 'h-2', 'overflow-hidden'];
const BASE_BAR_CLASSES = ['bg-green-500', 'h-full', 'transition', 'duration-500', 'ease-in-out'];
const BASE_SEPARATOR_CLASSES = ['inline-block h-full w-1.5'];

export const ProgressBar = ({ className, separatorClassName, total, completed, isLoading, title }: Props) => {
  const classes = cn(className, BASE_CLASSES);
  const barClasses = cn(BASE_BAR_CLASSES, { 'animate-pulse': isLoading });
  const separatorClasses = cn(separatorClassName, BASE_SEPARATOR_CLASSES);
  const width = useMemo(() => (completed / total) * 100, [total, completed]);

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col" style={{ width: '90%' }}>
        <div className="flex justify-between mt-2">
          {title && <Text className="text-xs text-gray-500"> {title} </Text>}
          <Text className="text-xs text-gray-500"> {completed}% </Text>
        </div>
        <div className={classes}>
          <motion.div
            className={barClasses}
            initial={{ width: `${width}%` }}
            animate={{ width: `${width}%` }}
            transition={{ ease: 'linear', duration: 0.2 }}
          />
          <div className="absolute top-0 left-0 flex justify-evenly w-full h-full">
            {map([...Array(total - 1)], (_, index) => (
              <div key={index} className={separatorClasses} />
            ))}
          </div>
        </div>
      </div>
      {completed === 100 && <Icon icon="tick-circle-filled" width={25} height={25} style={{ color: '#68d5c1' }} />}
    </div>
  );
};
