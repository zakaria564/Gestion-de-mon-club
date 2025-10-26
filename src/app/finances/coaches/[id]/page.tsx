
import { CoachPaymentHistoryClient } from './coach-payment-history-client';

export default function CoachPaymentHistoryPage({ params: { id: memberName } }: { params: { id: string } }) {

  if (!memberName) {
    return <div>Chargement...</div>;
  }

  return <CoachPaymentHistoryClient memberName={decodeURIComponent(memberName)} />;
}
