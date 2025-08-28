
import { PlayerPaymentDetailClient } from './player-payment-detail-client';

export default async function PlayerPaymentDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  return <PlayerPaymentDetailClient id={id} />;
}
