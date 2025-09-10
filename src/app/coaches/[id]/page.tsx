
import { CoachDetailClient } from './coach-detail-client';

export default function CoachDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;
  
  if (!id) {
    return <div>Chargement...</div>;
  }

  return <CoachDetailClient id={id} />;
}
