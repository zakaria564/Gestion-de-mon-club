
"use client";

import { CoachPaymentDetailClient } from './coach-payment-detail-client';
import { useParams } from 'next/navigation';
import React from 'react';

// This is now a Client Component
export default function CoachPaymentReceiptPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  if (!id) {
    return null;
  }
  
  return <CoachPaymentDetailClient id={id} />;
}
