
import { CoachDetailClient } from './coach-detail-client';
import React from 'react';

// This is a Server Component
export default function CoachDetailPage({ params }: { params: { id: string } }) {
  // Use React.use() to unwrap the dynamic params object
  const stableParams = React.use(params);

  // Pass the id directly to the client component
  return <CoachDetailClient id={stableParams.id} />;
}
