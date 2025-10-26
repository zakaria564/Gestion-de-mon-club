
import { CoachPaymentHistoryClient } from './coach-payment-history-client';
import React from 'react';

export default function CoachPaymentHistoryPage(props: { params: { id: string } }) {
  const params = React.use(props.params);
  const { id: memberName } = params;

  if (!memberName) {
    return <div>Chargement...</div>;
  }

  return <CoachPaymentHistoryClient memberName={decodeURIComponent(memberName)} />;
}
