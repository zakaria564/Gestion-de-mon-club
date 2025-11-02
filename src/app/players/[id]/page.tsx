
import { PlayerDetailClient } from './player-detail-client';
import React from 'react';

// This is a Server Component
export default function PlayerDetailPage({ params }: { params: { id: string } }) {
  // Pass the id directly to the client component
  return <PlayerDetailClient id={params.id} />;
}
