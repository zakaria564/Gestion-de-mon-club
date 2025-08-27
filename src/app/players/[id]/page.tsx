
import { PlayerDetailClient } from './player-detail-client';

// The page component is a server component, so we can access params directly
// and pass them to the client component. This avoids the "params should be awaited" error.
export default function PlayerDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  return <PlayerDetailClient id={id} />;
}
