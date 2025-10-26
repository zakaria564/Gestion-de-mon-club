
import { PlayerPaymentDetailClient } from './player-payment-detail-client';
import React from 'react';

export default function PlayerPaymentReceiptPage(props: { params: { id: string } }) {
  const params = React.use(props.params);
  const { id } = params;

  if (!id) {
    return <div>Chargement...</div>;
  }

  return <PlayerPaymentDetailClient id={id} />;
}
