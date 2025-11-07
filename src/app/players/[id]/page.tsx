
"use client";

import { PlayerDetailClient } from './player-detail-client';
import { useParams } from 'next/navigation';
import React from 'react';

// This is now a Client Component
export default function PlayerDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  if (!id) {
    // Optionally, render a loading state or null
    return null;
  }
  
  return <PlayerDetailClient id={id} />;
}
