
'use client';

import { CoachDetailClient } from './coach-detail-client';
import React from 'react';
import { useParams } from 'next/navigation';

export default function CoachDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  
  if (!id) {
    return <div>Chargement...</div>;
  }

  return <CoachDetailClient id={id} />;
}
