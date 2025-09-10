
"use client";
import { useParams } from 'next/navigation';
import { PlayerPaymentDetailClient } from './player-payment-detail-client';

export default function PlayerPaymentDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';

  if (!id) {
    return <div>Chargement...</div>;
  }

  return <PlayerPaymentDetailClient id={id} />;
}

    