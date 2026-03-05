
import { CoachPaymentDetailClient } from './coach-payment-detail-client';
import React from 'react';

export default async function CoachPaymentReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CoachPaymentDetailClient id={id} />;
}
