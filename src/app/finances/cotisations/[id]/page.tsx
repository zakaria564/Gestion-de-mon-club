
import { PlayerPaymentHistoryClient } from './player-payment-history-client';
import React from 'react';

export default function PlayerPaymentHistoryPage({ params }: { params: { id: string } }) {
  const { id: memberName } = React.use(params);

  if (!memberName) {
    return <div>Chargement...</div>;
  }

  return <PlayerPaymentHistoryClient memberName={decodeURIComponent(memberName)} />;
}
