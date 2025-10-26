
import { PlayerPaymentHistoryClient } from './player-payment-history-client';

export default function PlayerPaymentHistoryPage({ params: { id: memberName } }: { params: { id: string } }) {

  if (!memberName) {
    return <div>Chargement...</div>;
  }

  return <PlayerPaymentHistoryClient memberName={decodeURIComponent(memberName)} />;
}
