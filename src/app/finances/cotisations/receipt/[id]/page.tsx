
"use client";

import { use } from 'react';
import { PlayerPaymentDetailClient } from './player-payment-detail-client';
import React from 'react';

export default function PlayerPaymentReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <PlayerPaymentDetailClient id={id} />;
}
