import React from 'react';
import { CircularSkeleton } from './circular-skeleton.component';

export default {
  title: 'Components/CircularSkeletons',
  component: CircularSkeleton,
};

export const Index = () => (
  <>
    <div>
      <CircularSkeleton className="mr-2" size="sm" />
      <CircularSkeleton className="mr-2" size="md" />
      <CircularSkeleton className="mr-2" size="lg" />
    </div>
    <div className="mt-2">
      <CircularSkeleton className="mr-2" size="sm" isLoading={false} />
      <CircularSkeleton className="mr-2" size="md" isLoading={false} />
      <CircularSkeleton className="mr-2" size="lg" isLoading={false} />
    </div>
  </>
);
