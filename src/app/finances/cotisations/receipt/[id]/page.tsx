
import { PlayerPaymentDetailClient } from './player-payment-detail-client';
import React from 'react';

// This is a Server Component
export default function PlayerPaymentReceiptPage({ params }: { params: { id: string } }) {
  // Pass the id directly to the client component
  return <PlayerPaymentDetailClient id={params.id} />;
}
