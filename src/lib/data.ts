export type PlayerDocument = {
  name: string;
  url: string;
  expirationDate?: string;
};

export type Player = {
  id: string;
  uid: string;
  name: string; // Nom de famille
  firstName?: string; // Prénom
  birthDate: string;
  birthPlace?: string; // Lieu de naissance
  gender: 'Masculin' | 'Féminin';
  nationality?: string;
  
  // Sportif
  category: 'Sénior' | 'U23' | 'U20' | 'U19' | 'U18' | 'U17' | 'U16' | 'U15' | 'U13' | 'U11' | 'U9' | 'U7';
  poste: string;
  jerseyNumber: number;
  strongFoot?: 'Droitier' | 'Gaucher' | 'Ambidextre';
  height?: number;
  weight?: number;
  
  // Contact & Parents
  phone: string;
  emergencyPhone?: string;
  email?: string;
  address: string;
  country: string;
  tutorName?: string;
  
  // Médical
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  medicalConditions?: string; // Allergies / Traitement
  medicalCertificateStatus?: 'Fourni' | 'Non fourni';
  photo?: string;
  cin?: string;
  
  // Financier
  registrationFeeStatus?: 'Payé' | 'Non payé';
  subscriptionType?: 'Mensuel' | 'Trimestriel' | 'Annuel';
  subscriptionAmount?: number;

  status: 'Actif' | 'Blessé' | 'Suspendu' | 'Inactif';
  entryDate?: string;
  exitDate?: string;
  coachName?: string;
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
  category: string;
  documents?: PlayerDocument[];
  gender: 'Masculin' | 'Féminin';
}

export type CalendarEvent = {
  id: string;
  uid: string;
  type: string;
  opponent: string;
  homeTeam?: string;
  awayTeam?: string;
  matchType?: 'club-match' | 'opponent-vs-opponent';
  date: string;
  time: string;
  location: string;
  teamCategory: string;
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
