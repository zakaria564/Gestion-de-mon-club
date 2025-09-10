
"use client";
import { useParams } from 'next/navigation';
import { PlayerPaymentDetailClient } from '../player-payment-detail-client';

export default function PlayerPaymentDetailPage() {
  const params = useParams();
  const playerId = typeof params.id === 'string' ? params.id : '';
  const paymentId = typeof params.paymentId === 'string' ? params.paymentId : '';

  if (!playerId || !paymentId) {
    return <div>Chargement...</div>;
  }

  return <PlayerPaymentDetailClient playerId={playerId} paymentId={paymentId} />;
}
