
import { CoachPaymentHistoryClient } from './coach-payment-history-client';
import React from 'react';

// This is a Server Component
export default function CoachPaymentHistoryPage({ params }: { params: { id: string } }) {
  // Pass the id directly to the client component
  const memberName = decodeURIComponent(params.id);
  return <CoachPaymentHistoryClient memberName={memberName} />;
}
