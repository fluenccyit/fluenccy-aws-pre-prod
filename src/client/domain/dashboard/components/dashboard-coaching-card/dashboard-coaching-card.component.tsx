import React from 'react';
import { Button, Card, CardContent, EXTERNAL_LINK, Text } from '@client/common';
import SpeechBubble from '@assets/images/speech-bubble.svg';

export const DashboardCoachingCard = ({ className = "" }) => (
  <Card className={`mt-3 w-full ${className}`}>
    <CardContent className="p-6 h-full">
      <div className="flex justify-between flex-col h-full">
        <div>
          <Text className="font-bold">Coaching</Text>
          <div className="flex justify-between mt-3">
            <Text className="text-2xl font-serif">Want some currency help?</Text>
            <SpeechBubble className="ml-2 overflow-visible" />
          </div>
          <Text className="font-helvetica text-base mt-3 leading-5" variant="gray" isBlock>
            Simplified currency terminology and detailed insights to help you understand how Current Impacts your business.
          </Text>
        </div>
        <div>
          <Button href={EXTERNAL_LINK.coaching} isLink isExternal isRounded className="mt-8 text-sm" isOpenedInNewTab>
            Visit centre
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);
