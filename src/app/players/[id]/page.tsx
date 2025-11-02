
import { PlayerDetailClient } from './player-detail-client';
import React from 'react';

export default function PlayerDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) {
    return <div>Chargement...</div>;
  }

  return <PlayerDetailClient id={id} />;
}
