
"use client";

import { use } from 'react';
import { PlayerPaymentHistoryClient } from './player-payment-history-client';
import React from 'react';

export default function PlayerPaymentHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <PlayerPaymentHistoryClient id={id} />;
}
