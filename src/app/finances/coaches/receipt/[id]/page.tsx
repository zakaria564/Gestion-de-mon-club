
'use client';

import { CoachPaymentDetailClient } from './coach-payment-detail-client';
import React from 'react';
import { useParams } from 'next/navigation';

export default function CoachPaymentReceiptPage() {
  const params = useParams();
  const id = params?.id as string;

  if (!id) {
    return <div>Chargement...</div>;
  }

  return <CoachPaymentDetailClient id={id} />;
}
