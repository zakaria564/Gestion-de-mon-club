
import { PlayerDetailClient } from './player-detail-client';

export default function PlayerDetailPage({ params }: { params: { id: string } }) {
  return <PlayerDetailClient id={params.id} />;
}
