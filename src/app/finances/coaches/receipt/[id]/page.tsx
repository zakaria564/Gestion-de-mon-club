
import { CoachPaymentDetailClient } from './coach-payment-detail-client';

export default function CoachPaymentReceiptPage({ params }: { params: { id: string } }) {
  const { id } = params;

  if (!id) {
    return <div>Chargement...</div>;
  }

  return <CoachPaymentDetailClient id={id} />;
}
