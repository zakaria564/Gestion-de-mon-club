
import { PlayerPaymentHistoryClient } from './player-payment-history-client';
import React from 'react';

export default function PlayerPaymentHistoryPage(props: { params: { id: string } }) {
  const params = React.use(props.params);
  const { id: memberName } = params;

  if (!memberName) {
    return <div>Chargement...</div>;
  }

  return <PlayerPaymentHistoryClient memberName={decodeURIComponent(memberName)} />;
}
