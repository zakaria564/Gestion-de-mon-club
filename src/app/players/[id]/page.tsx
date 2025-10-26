
import { PlayerDetailClient } from './player-detail-client';
import React from 'react';

export default function PlayerDetailPage(props: { params: { id: string } }) {
  const params = React.use(props.params);
  const { id } = params;

  if (!id) {
    // Optionnel: afficher un état de chargement ou un message d'erreur si l'ID n'est pas disponible
    return <div>Chargement...</div>;
  }

  return <PlayerDetailClient id={id} />;
}
