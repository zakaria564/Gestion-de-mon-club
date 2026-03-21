import { PlayerDetailClient } from './player-detail-client';
import React from 'react';

export default async function PlayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlayerDetailClient id={id} />;
}
