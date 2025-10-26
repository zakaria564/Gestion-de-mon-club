
import { PlayerPaymentHistoryClient } from './player-payment-history-client';

export default function PlayerPaymentHistoryPage({ params }: { params: { id: string } }) {
  const { id: memberName } = params;

  if (!memberName) {
    return <div>Chargement...</div>;
  }

  return <PlayerPaymentHistoryClient memberName={decodeURIComponent(memberName)} />;
}
