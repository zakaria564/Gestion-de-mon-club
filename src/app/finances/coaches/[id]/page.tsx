
import { CoachPaymentDetailClient } from './coach-payment-detail-client';

export default function CoachPaymentDetailPage({ params }: { params: { id: string } }) {
  return <CoachPaymentDetailClient id={params.id} />;
}
