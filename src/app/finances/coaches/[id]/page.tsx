
import { CoachPaymentHistoryClient } from './coach-payment-history-client';

export default function CoachPaymentHistoryPage({ params }: { params: { id: string } }) {
  const { id: memberName } = params;

  if (!memberName) {
    return <div>Chargement...</div>;
  }

  return <CoachPaymentHistoryClient memberName={decodeURIComponent(memberName)} />;
}
