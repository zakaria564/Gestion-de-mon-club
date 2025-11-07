
"use client";

import { PlayerPaymentDetailClient } from './player-payment-detail-client';
import { useParams } from 'next/navigation';
import React from 'react';

// This is now a Client Component
export default function PlayerPaymentReceiptPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  if (!id) {
    return null;
  }
  
  return <PlayerPaymentDetailClient id={id} />;
}
