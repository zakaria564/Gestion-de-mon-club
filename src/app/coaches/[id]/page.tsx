
import { CoachDetailClient } from './coach-detail-client';
import React from 'react';

export default function CoachDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) {
    return <div>Chargement...</div>;
  }

  return <CoachDetailClient id={id} />;
}
