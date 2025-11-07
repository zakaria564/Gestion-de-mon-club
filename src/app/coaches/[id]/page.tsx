
"use client";

import { CoachDetailClient } from './coach-detail-client';
import { useParams } from 'next/navigation';
import React from 'react';

// This is now a Client Component
export default function CoachDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  if (!id) {
    return null;
  }

  return <CoachDetailClient id={id} />;
}
