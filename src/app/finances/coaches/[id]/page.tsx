
'use client';

import { CoachPaymentHistoryClient } from './coach-payment-history-client';
import React from 'react';
import { useParams } from 'next/navigation';

export default function CoachPaymentHistoryPage() {
  const params = useParams();
  const memberName = params?.id as string;

  if (!memberName) {
    return <div>Chargement...</div>;
  }

  return <CoachPaymentHistoryClient memberName={decodeURIComponent(memberName)} />;
}
