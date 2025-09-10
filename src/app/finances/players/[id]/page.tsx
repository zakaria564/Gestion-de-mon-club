
"use client";
import { useParams } from 'next/navigation';
import { PlayerPaymentsClient } from './player-payments-client';

export default function PlayerPaymentsPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';

  if (!id) {
    return <div>Chargement...</div>;
  }

  return <PlayerPaymentsClient playerId={id} />;
}


