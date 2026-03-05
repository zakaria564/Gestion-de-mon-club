
import { PlayerPaymentHistoryClient } from './player-payment-history-client';
import React from 'react';

export default async function PlayerPaymentHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlayerPaymentHistoryClient id={id} />;
}
