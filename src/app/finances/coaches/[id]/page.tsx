
import { CoachPaymentDetailClient } from './coach-payment-detail-client';

export default async function CoachPaymentDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  return <CoachPaymentDetailClient id={id} />;
}
