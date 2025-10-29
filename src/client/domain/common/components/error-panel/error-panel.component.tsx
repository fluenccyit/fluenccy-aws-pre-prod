import React, { memo } from 'react';
import cn from 'classnames';
import { useIntercom } from 'react-use-intercom';
import { Text, Button } from '@client/common';
import ErrorImage from '@assets/images/error.png';

type Props = {
  className?: string;
  state?: 'not-found';
};

const BASE_CLASSES = ['flex', 'flex-col', 'items-center', 'justify-center'];

export const ErrorPanel = memo(({ className, state }: Props) => {
  const classes = cn(className, BASE_CLASSES);
  const { show: showIntercom } = useIntercom();

  return (
    <div className={classes}>
      <div className="h-96 w-96">
        <img src={ErrorImage} alt="cartoon chart with detached bars" />
      </div>
      <Text className="mb-4 text-3xl font-bold" isBlock>
        {state === 'not-found' ? "Looks like that page doesn't exist." : "Oh, that wasn't meant to happen."}
      </Text>
      <Text className="mb-8" isBlock>
        {state === 'not-found' ? 'Try another URL, or click the button below.' : "Try reloading the page. If that doesn't work please get in touch."}
      </Text>
      {state === 'not-found' ? (
        <Button href="/" isLink>
          Go to the currency score
        </Button>
      ) : (
        <Button onClick={showIntercom}>Contact support</Button>
      )}
    </div>
  );
});
