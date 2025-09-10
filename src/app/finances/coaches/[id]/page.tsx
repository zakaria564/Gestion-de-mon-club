
import { CoachPaymentHistoryClient } from './coach-payment-history-client';

export default function CoachPaymentHistoryPage({ params }: { params: { id: string } }) {
  const memberName = params.id;

  if (!memberName) {
    return <div>Chargement...</div>;
  }

  return <CoachPaymentHistoryClient memberName={decodeURIComponent(memberName)} />;
}
