

export type Player = {
  id: string;
  name: string;
  birthDate: string;
  address: string;
  poste: string;
  status: 'Actif' | 'Blessé' | 'Suspendu';
  phone: string;
  email: string;
  tutorName: string;
  tutorPhone: string;
  photo: string;
  jerseyNumber: number;
  category: string;
}

export type Coach = {
  id: string;
  name: string;
  specialization: string;
  status: 'Actif' | 'Inactif';
  contact: string;
  category: string;
  phone: string;
  photo: string;
}

export type CalendarEvent = {
  id: string;
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

export const players: Player[] = [];
export const coaches: Coach[] = [];
export const calendarEvents: CalendarEvent[] = [];


export const upcomingEvents = calendarEvents.slice(0, 2);

export const results = [
  { id: 1, opponent: 'FC Bordeaux', date: '2024-08-01', score: '3-1', scorers: ['J. Dupont (2)', 'P. Martin'], notes: 'Belle victoire, bonne performance défensive.' },
  { id: 2, opponent: 'Paris SG', date: '2024-07-25', score: '0-2', scorers: [], notes: 'Match difficile contre une équipe solide.' },
  { id: 3, opponent: 'OGC Nice', date: '2024-07-18', score: '2-2', scorers: ['J. Dupont', 'M. Curie'], notes: 'Match nul arraché en fin de partie.' },
];

export const notifications = [
    { id: 1, message: 'Rappel: Inscriptions pour la nouvelle saison ouvertes.', date: '2024-08-10', priority: 'Moyenne' },
    { id: 2, message: 'Le prochain match a été déplacé à 19h.', date: '2024-08-12', priority: 'Haute' },
];
