
import { PlayerPaymentDetailClient } from './player-payment-detail-client';

export default function PlayerPaymentDetailPage({ params }: { params: { id: string } }) {
  return <PlayerPaymentDetailClient id={params.id} />;
}
