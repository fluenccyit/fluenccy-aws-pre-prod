import React, { ReactNode, useMemo } from 'react';
import cn from 'classnames';
import { motion } from 'framer-motion';
import { TAILWIND_THEME } from '@client/common';

type Props = {
  children?: ReactNode;
  className?: string;
  total: number;
  completed: number;
  variant?: 'success' | 'danger' | 'warning';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  borderColor?: string;
};

const BASE_CLASSES = ['inline-block'];
const BASE_CONTENT_CLASSES = ['absolute', 'top-1/2', 'left-1/2', 'transform', '-translate-y-1/2', '-translate-x-1/2'];

export const ProgressWheel = ({ children, className, total, completed, size = 'md', variant = 'success', borderColor }: Props) => {
  const classes = cn(className, BASE_CLASSES);
  const contentClasses = cn(BASE_CONTENT_CLASSES, {
    'mt-2': size === 'md' || size === 'lg' || size === 'xl',
  });

  const percentage = useMemo(() => {
    if (!total) {
      return 0;
    }

    return completed <= total ? (completed / total) * 100 : 100;
  }, [total, completed]);

  const color = useMemo(() => {
    switch (variant) {
      case 'success':
        return borderColor || TAILWIND_THEME.colors.green[500];
      case 'warning':
        return borderColor || TAILWIND_THEME.colors.orange[500];
      case 'danger':
        return borderColor || TAILWIND_THEME.colors.red[500];
    }
  }, [variant]);

  const { length, strokeWidth, strokeOffset, innerStrokeWidth } = useMemo(() => {
    switch (size) {
      case 'xs':
        return { length: 70, strokeWidth: 5, strokeOffset: 1.55, innerStrokeWidth: 2 };
      case 'sm':
        return { length: 150, strokeWidth: 5, strokeOffset: 1.55, innerStrokeWidth: 2 };
      case 'md':
      default:
        return { length: 200, strokeWidth: 7, strokeOffset: 2.55, innerStrokeWidth: 2 };
      case 'lg':
        return { length: 290, strokeWidth: 12, strokeOffset: 4.55, innerStrokeWidth: 3 };
      case 'xl':
        return { length: 450, strokeWidth: 12, strokeOffset: 2.85, innerStrokeWidth: 6 };
    }
  }, [size]);

  const viewBox = useMemo(() => `0 0 ${length} ${length}`, [length]);
  const radius = useMemo(() => (length - strokeWidth) / 2, [length, strokeWidth]);
  const strokeDasharray = useMemo(() => radius * Math.PI * 2, [size, percentage]);
  const strokeDashoffset = useMemo(() => strokeDasharray - (strokeDasharray * percentage) / 100, [strokeDasharray, percentage]);

  return (
    <div className={classes}>
      <div className="relative">
        <svg className="overflow-visible" width={length} height={length} viewBox={viewBox}>
          <circle
            fill="none"
            stroke={TAILWIND_THEME.colors.gray[300]}
            cx={length / 2}
            cy={length / 2}
            r={radius + strokeOffset}
            strokeWidth={`${innerStrokeWidth}px`}
          />

          <motion.circle
            fill="none"
            stroke={color}
            cx={length / 2}
            cy={length / 2}
            r={radius}
            strokeWidth={`${strokeWidth}px`}
            strokeDashoffset={strokeDasharray}
            transform={`rotate(-90 ${length / 2} ${length / 2})`}
            animate={{ strokeDasharray, strokeDashoffset }}
            transition={{ ease: 'easeInOut', duration: 0.3 }}
          />
        </svg>
        {children && <div className={contentClasses}>{children}</div>}
      </div>
    </div>
  );
};
