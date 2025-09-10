
import { CoachPaymentDetailClient } from './coach-payment-detail-client';

export default function CoachPaymentDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;

  if (!id) {
    return <div>Chargement...</div>;
  }

  return <CoachPaymentDetailClient id={id} />;
}

    