
"use client";
import { useParams } from 'next/navigation';
import { PlayerDetailClient } from './player-detail-client';

export default function PlayerDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';

  if (!id) {
    // Optionnel: afficher un état de chargement ou un message d'erreur si l'ID n'est pas disponible
    return <div>Chargement...</div>;
  }

  return <PlayerDetailClient id={id} />;
}
