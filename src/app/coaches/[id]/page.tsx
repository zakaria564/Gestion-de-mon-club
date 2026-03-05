
import { CoachDetailClient } from './coach-detail-client';
import React from 'react';

export default async function CoachDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CoachDetailClient id={id} />;
}
