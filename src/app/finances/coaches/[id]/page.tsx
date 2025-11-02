
import { CoachPaymentHistoryClient } from './coach-payment-history-client';
import React from 'react';

export default function CoachPaymentHistoryPage({ params }: { params: { id: string } }) {
  const { id } = React.use(params);

  if (!id) {
    return <div>Chargement...</div>;
  }

  // The id is URL encoded, so we need to decode it.
  const memberName = decodeURIComponent(id);

  return <CoachPaymentHistoryClient memberName={memberName} />;
}
