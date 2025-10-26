
import { PlayerDetailClient } from './player-detail-client';
import React from 'react';

export default function PlayerDetailPage(props: { params: { id: string } }) {
  const params = React.use(props.params);
  const { id } = params;
  if (!id) {
    return <div>Chargement...</div>;
  }

  return <PlayerDetailClient id={id} />;
}
