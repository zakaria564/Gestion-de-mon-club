
import { CoachPaymentDetailClient } from './coach-payment-detail-client';
import React from 'react';

// This is a Server Component
export default function CoachPaymentReceiptPage({ params }: { params: { id: string } }) {
  // Use React.use() to unwrap the dynamic params object
  const stableParams = React.use(params);
  
  // Pass the id directly to the client component
  return <CoachPaymentDetailClient id={stableParams.id} />;
}
