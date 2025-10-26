
import { PlayerDetailClient } from './player-detail-client';
import React from 'react';

export default function PlayerDetailPage({ params }: { params: { id: string } }) {
  const { id } = React.use(params);
  if (!id) {
    return <div>Chargement...</div>;
  }

  return <PlayerDetailClient id={id} />;
}
