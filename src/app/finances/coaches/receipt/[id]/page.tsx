
"use client";

import { use } from 'react';
import { CoachPaymentDetailClient } from './coach-payment-detail-client';
import React from 'react';

export default function CoachPaymentReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <CoachPaymentDetailClient id={id} />;
}
