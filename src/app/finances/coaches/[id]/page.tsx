
"use client";

import { use } from 'react';
import { CoachPaymentHistoryClient } from './coach-payment-history-client';
import React from 'react';

export default function CoachPaymentHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <CoachPaymentHistoryClient id={id} />;
}
