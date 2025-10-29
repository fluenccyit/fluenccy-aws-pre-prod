import React from 'react';
import { Card, CardContent, CardSeparator, CircularSkeleton, TextSkeleton } from '@client/common';

type Props = {
  isLoading?: boolean;
};

export const DashboardForeignCurrencyCardSkeleton = ({ isLoading }: Props) => {
  return (
    <Card className="xl:w-1/2">
      <CardContent className="p-6">
        <TextSkeleton className="w-1/4 h-4 mb-4" isLoading={isLoading} />
        <TextSkeleton className="w-full h-7" isLoading={isLoading} />
        <div className="flex justify-between items-center w-full mt-6">
          <TextSkeleton className="h-4 w-1/3" isLoading={isLoading} />
          <div className="flex items-center">
            <TextSkeleton className="h-4 w-24 mr-2" isLoading={isLoading} />
            <CircularSkeleton size="md" isLoading={isLoading} />
          </div>
        </div>
        <CardSeparator />
        <div className="flex justify-between items-center w-full mt-6">
          <TextSkeleton className="h-4 w-1/3" isLoading={isLoading} />
          <TextSkeleton className="h-4 w-16 mr-2" isLoading={isLoading} />
        </div>
      </CardContent>
    </Card>
  );
};
