
'use client';

import { PlayerPaymentHistoryClient } from './player-payment-history-client';
import React from 'react';
import { useParams } from 'next/navigation';

export default function PlayerPaymentHistoryPage() {
  const params = useParams();
  const memberName = params.id as string;

  if (!memberName) {
    return <div>Chargement...</div>;
  }

  return <PlayerPaymentHistoryClient memberName={decodeURIComponent(memberName)} />;
}
