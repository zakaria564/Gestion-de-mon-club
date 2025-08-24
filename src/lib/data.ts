

export type Player = {
  id: string;
  uid: string;
  name: string;
  birthDate: string;
  poste: string;
  notes: string;
  photo: string;
  address: string;
}

export type Coach = {
  id: string;
  uid: string;
  name: string;
  specialization: string;
  phone: string;
  email: string;
  experience: number;
  notes: string;
  photo: string;
}

export type CalendarEvent = {
  id: string;
  uid: string;
  type: string;
  opponent: string;
  date: string;
  time: string;
  location: string;
};

export const clubStats = {
  totalPlayers: 45,
  totalCoaches: 5,
  upcomingEvents: 3,
  notifications: 2,
};

export const results = [
  { id: 1, opponent: 'FC Bordeaux', date: '2024-08-01', score: '3-1', scorers: ['J. Dupont (2)', 'P. Martin'], notes: 'Belle victoire, bonne performance défensive.' },
  { id: 2, opponent: 'Paris SG', date: '2024-07-25', score: '0-2', scorers: [], notes: 'Match difficile contre une équipe solide.' },
  { id: 3, opponent: 'OGC Nice', date: '2024-07-18', score: '2-2', scorers: ['J. Dupont', 'M. Curie'], notes: 'Match nul arraché en fin de partie.' },
];

export const notifications = [
    { id: 1, message: 'Rappel: Inscriptions pour la nouvelle saison ouvertes.', date: '2024-08-10', priority: 'Moyenne' },
    { id: 2, message: 'Le prochain match a été déplacé à 19h.', date: '2024-08-12', priority: 'Haute' },
];
