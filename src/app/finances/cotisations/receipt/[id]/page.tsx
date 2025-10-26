
import { PlayerPaymentDetailClient } from './player-payment-detail-client';
import React from 'react';

export default function PlayerPaymentReceiptPage({ params }: { params: { id: string } }) {
  const { id } = React.use(params);

  if (!id) {
    return <div>Chargement...</div>;
  }

  return <PlayerPaymentDetailClient id={id} />;
}
