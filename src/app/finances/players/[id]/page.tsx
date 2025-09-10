
"use client";
import { useParams } from 'next/navigation';
import { PlayerPaymentsClient } from './player-payments-client';

export default function PlayerPaymentsPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';

  return <PlayerPaymentsClient playerId={id} />;
}

