
"use client";

import { PlayerDetailClient } from './player-detail-client';
import { useParams } from 'next/navigation';
import React from 'react';

// This is now a Client Component
export default function PlayerDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  if (!id) {
    // Optionally, render a loading state or null
    return null;
  }
  
  return <PlayerDetailClient id={id} />;
}
