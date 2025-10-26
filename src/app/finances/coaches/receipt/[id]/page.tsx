
import { CoachPaymentDetailClient } from './coach-payment-detail-client';

export default function CoachPaymentReceiptPage({ params: { id } }: { params: { id: string } }) {

  if (!id) {
    return <div>Chargement...</div>;
  }

  return <CoachPaymentDetailClient id={id} />;
}
