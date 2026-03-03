
"use client";

import { use } from 'react';
import { CoachDetailClient } from './coach-detail-client';
import React from 'react';

export default function CoachDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <CoachDetailClient id={id} />;
}
