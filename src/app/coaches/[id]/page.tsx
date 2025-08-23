
import { CoachDetailClient } from './coach-detail-client';

export default function CoachDetailPage({ params }: { params: { id: string } }) {
  return <CoachDetailClient id={params.id} />;
}
