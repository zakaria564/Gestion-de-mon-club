
import { PlayerPaymentDetailClient } from './player-payment-detail-client';
import React from 'react';

export default async function PlayerPaymentReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlayerPaymentDetailClient id={id} />;
}
