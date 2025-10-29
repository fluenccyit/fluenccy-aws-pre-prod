import React, { memo } from 'react';
import cn from 'classnames';
import { Button } from '@client/common';

const BASE_CLASSES = ['flex', 'items-center', 'border-gray-200', 'h-full', 'px-6'];

export const Actions = memo(({ onAction, disableQuotes }) => {
  const buttons = [
    {
      id: 'edit',
      label: 'Edit',
      bgColor: 'rgba(26, 180, 215, var(--tw-bg-opacity))',
      fColor: 'white',
    },
    {
      id: 'clear',
      label: 'Clear',
      bgColor: 'rgba(255, 105, 120, var(--tw-bg-opacity))',
      fColor: 'white',
      margin: '0  5px',
    },
    {
      id: 'getQuotes',
      label: 'Get Quotes',
      // bgColor: 'green',
      fColor: 'white',
      disabled: disableQuotes,
    },
  ];

  const onClick = (key) => () => onAction(key);

  return (
    <div className={cn(BASE_CLASSES)}>
      {buttons.map((button) => (
        <Button
          isDisabled={button.disabled}
          key={button.id}
          onClick={onClick(button.id)}
          style={{ backgroundColor: button.bgColor, color: button.fColor, margin: button.margin }}
          isRounded
        >
          {button.label}
        </Button>
      ))}
    </div>
  );
});
