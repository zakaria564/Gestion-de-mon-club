
"use client";

import { CoachPaymentHistoryClient } from './coach-payment-history-client';
import { useParams } from 'next/navigation';
import React from 'react';

// This is now a Client Component
export default function CoachPaymentHistoryPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  if (!id) {
    return null;
  }
  
  const memberName = decodeURIComponent(id);
  return <CoachPaymentHistoryClient memberName={memberName} />;
}
