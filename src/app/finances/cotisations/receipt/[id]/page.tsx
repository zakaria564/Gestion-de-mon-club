
import { PlayerPaymentDetailClient } from './player-payment-detail-client';

export default function PlayerPaymentReceiptPage({ params: { id } }: { params: { id: string } }) {

  if (!id) {
    return <div>Chargement...</div>;
  }

  return <PlayerPaymentDetailClient id={id} />;
}
