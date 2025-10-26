
import { CoachDetailClient } from './coach-detail-client';

export default function CoachDetailPage({ params: { id } }: { params: { id: string } }) {
  if (!id) {
    return <div>Chargement...</div>;
  }

  return <CoachDetailClient id={id} />;
}
