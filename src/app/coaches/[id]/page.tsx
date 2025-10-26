
import { CoachDetailClient } from './coach-detail-client';
import React from 'react';

export default function CoachDetailPage(props: { params: { id: string } }) {
  const params = React.use(props.params);
  const { id } = params;
  if (!id) {
    return <div>Chargement...</div>;
  }

  return <CoachDetailClient id={id} />;
}
