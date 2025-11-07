
"use client";

import { PlayerPaymentHistoryClient } from './player-payment-history-client';
import { useParams } from 'next/navigation';
import React from 'react';

// This is now a Client Component
export default function PlayerPaymentHistoryPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  if (!id) {
    return null;
  }

  const memberName = decodeURIComponent(id);
  return <PlayerPaymentHistoryClient memberName={memberName} />;
}
