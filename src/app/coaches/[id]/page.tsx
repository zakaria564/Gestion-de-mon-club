
"use client";
import { useParams } from 'next/navigation';
import { CoachDetailClient } from './coach-detail-client';

export default function CoachDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  
  if (!id) {
    return <div>Chargement...</div>;
  }

  return <CoachDetailClient id={id} />;
}
