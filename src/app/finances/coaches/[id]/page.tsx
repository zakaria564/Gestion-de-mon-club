
"use client";
import { useParams } from 'next/navigation';
import { CoachPaymentDetailClient } from './coach-payment-detail-client';

export default function CoachPaymentDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';

  if (!id) {
    return <div>Chargement...</div>;
  }

  return <CoachPaymentDetailClient id={id} />;
}
