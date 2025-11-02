
'use client';

import { PlayerPaymentDetailClient } from './player-payment-detail-client';
import React from 'react';
import { useParams } from 'next/navigation';

export default function PlayerPaymentReceiptPage() {
  const params = useParams();
  const id = params.id as string;

  if (!id) {
    return <div>Chargement...</div>;
  }

  return <PlayerPaymentDetailClient id={id} />;
}
