
import { PlayerPaymentDetailClient } from './player-payment-detail-client';

export default function PlayerPaymentReceiptPage({ params }: { params: { id: string } }) {
  const { id } = params;

  if (!id) {
    return <div>Chargement...</div>;
  }

  return <PlayerPaymentDetailClient id={id} />;
}
