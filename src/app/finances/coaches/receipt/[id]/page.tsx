
import { CoachPaymentDetailClient } from './coach-payment-detail-client';
import React from 'react';

export default function CoachPaymentReceiptPage({ params }: { params: { id: string } }) {
  const { id } = React.use(params);

  if (!id) {
    return <div>Chargement...</div>;
  }

  return <CoachPaymentDetailClient id={id} />;
}
