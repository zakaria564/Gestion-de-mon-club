
import { CoachPaymentDetailClient } from './coach-payment-detail-client';
import React from 'react';

export default function CoachPaymentReceiptPage(props: { params: { id: string } }) {
  const params = React.use(props.params);
  const { id } = params;

  if (!id) {
    return <div>Chargement...</div>;
  }

  return <CoachPaymentDetailClient id={id} />;
}
