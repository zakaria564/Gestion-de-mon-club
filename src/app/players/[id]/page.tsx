
"use client";

import { use } from 'react';
import { PlayerDetailClient } from './player-detail-client';
import React from 'react';

export default function PlayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <PlayerDetailClient id={id} />;
}
