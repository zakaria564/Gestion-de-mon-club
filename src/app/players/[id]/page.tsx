
import { PlayerDetailClient } from './player-detail-client';

export default function PlayerDetailPage({ params: { id } }: { params: { id: string } }) {

  if (!id) {
    // Optionnel: afficher un état de chargement ou un message d'erreur si l'ID n'est pas disponible
    return <div>Chargement...</div>;
  }

  return <PlayerDetailClient id={id} />;
}
