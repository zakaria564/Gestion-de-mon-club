
import { CoachPaymentHistoryClient } from './coach-payment-history-client';
import React from 'react';

export default async function CoachPaymentHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CoachPaymentHistoryClient id={id} />;
}
