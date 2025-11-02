
import { PlayerDetailClient } from './player-detail-client';
import React from 'react';

export default function PlayerDetailPage({ params }: { params: { id: string } }) {
  // We can safely access params.id here because this is a Server Component.
  // We then pass the id as a prop to the Client Component.
  const { id } = React.use(params);
  
  if (!id) {
    return <div>Chargement...</div>;
  }

  return <PlayerDetailClient id={id} />;
}
