

export type PlayerDocument = {
  name: string;
  url: string;
  expirationDate?: string;
};

export type Player = {
  id: string;
  uid: string;
  name: string;
  birthDate: string;
  phone: string;
  email?: string;
  address: string;
  country: string;
  poste: string;
  jerseyNumber: number;
  photo?: string;
  cin?: string;
  gender: 'Masculin' | 'Féminin';
  tutorName?: string;
  tutorPhone?: string;
  tutorEmail?: string;
  tutorCin?: string;
  status: 'Actif' | 'Blessé' | 'Suspendu' | 'Inactif';
  category: 'Sénior' | 'U23' | 'U20' | 'U19' | 'U18' | 'U17' | 'U16' | 'U15' | 'U13' | 'U11' | 'U9' | 'U7';
  entryDate?: string;
  exitDate?: string;
  documents?: PlayerDocument[];
}

export type Coach = {
  id: string;
  uid: string;
  name: string;
  specialization: string;
  phone: string;
  email: string;
  address: string;
  country: string;
  experience: number;
  photo?: string;
  cin?: string;
  status: 'Actif' | 'Inactif';
  category: 'Sénior' | 'U23' | 'U20' | 'U19' | 'U18' | 'U17' | 'U16' | 'U15' | 'U13' | 'U11' | 'U9' | 'U7';
  documents?: PlayerDocument[];
  gender: 'Masculin' | 'Féminin';
}

export type CalendarEvent = {
  id: string;
  uid: string;
  type: string;
  opponent: string;
  date: string;
  time: string;
  location: string;
  teamCategory: 'Sénior' | 'U23' | 'U20' | 'U19' | 'U18' | 'U17' | 'U16' | 'U15' | 'U13' | 'U11' | 'U9' | 'U7';
  gender: 'Masculin' | 'Féminin';
  homeOrAway?: 'home' | 'away';
};

export type Notification = {
    id: string;
    uid: string;
    message: string;
    date: string;
    priority: 'Haute' | 'Moyenne';
}

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
    
