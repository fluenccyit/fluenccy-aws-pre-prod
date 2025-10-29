import React from 'react';
import cn from 'classnames';
import { ChartControlsRight } from './chart-controls-right.component';
import { ChartControlsLeft } from './chart-controls-left.component';

const BASE_CLASSES = ['flex', 'bg-white'];

export const ChartControls = ({showRight = true, showLeft = true, absolute = true, border = true, fullWidth = true, ...rest}) => (
  <div className={cn(BASE_CLASSES, [absolute ? 'absolute' : 'relative', border ? 'border-b border-gray-300 shadow-md' : '', fullWidth ? 'w-full h-16' : ''])}>
    {showLeft && <ChartControlsLeft {...rest} />}
    {showRight && <ChartControlsRight {...rest} />}
  </div>
);
