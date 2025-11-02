
'use client';

import { PlayerDetailClient } from './player-detail-client';
import React from 'react';
import { useParams } from 'next/navigation';

export default function PlayerDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  
  if (!id) {
    return <div>Chargement...</div>;
  }

  return <PlayerDetailClient id={id} />;
}
