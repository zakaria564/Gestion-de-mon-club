
import { PlayerPaymentHistoryClient } from './player-payment-history-client';
import React from 'react';

// This is a Server Component
export default function PlayerPaymentHistoryPage({ params }: { params: { id: string } }) {
  // Use React.use() to unwrap the dynamic params object
  const stableParams = React.use(params);

  // Pass the decoded memberName directly to the client component
  const memberName = decodeURIComponent(stableParams.id);
  return <PlayerPaymentHistoryClient memberName={memberName} />;
}
