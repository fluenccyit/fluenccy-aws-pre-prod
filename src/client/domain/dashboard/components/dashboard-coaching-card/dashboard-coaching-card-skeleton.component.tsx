import React from 'react';
import { Card, CardContent, CircularSkeleton, TextSkeleton } from '@client/common';

type Props = {
  isLoading?: boolean;
};

export const DashboardCoachingCardSkeleton = ({ isLoading, className }: Props) => (
  <Card className={`mt-6 xl:mt-0 xl:w-1/2 xl:ml-6 ${className}`}>
    <CardContent className="p-6 h-full">
      <div className="flex justify-between flex-col h-full">
        <div>
          <TextSkeleton className="w-1/5 h-4 mb-6" isLoading={isLoading} />
          <div className="flex justify-between mt-3">
            <TextSkeleton className="w-2/3 h-8 mb-6" isLoading={isLoading} />
            <CircularSkeleton size="lg" isLoading={isLoading} />
          </div>
          <TextSkeleton className="w-full h-4" isLoading={isLoading} />
        </div>
        <TextSkeleton className="w-1/4 h-8 mt-8" isLoading={isLoading} />
      </div>
    </CardContent>
  </Card>
);
