
"use client";

import { PlayerPaymentDetailClient } from './player-payment-detail-client';
import { useParams } from 'next/navigation';
import React from 'react';

// This is now a Client Component
export default function PlayerPaymentReceiptPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  if (!id) {
    return null;
  }
  
  return <PlayerPaymentDetailClient id={id} />;
}
