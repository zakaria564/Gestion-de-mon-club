export const clubStats = {
  totalPlayers: 45,
  totalCoaches: 5,
  upcomingEvents: 3,
  notifications: 2,
};

export const players = [
  { id: 1, name: 'Jean Dupont', birthDate: '2000-01-15', address: '123 Rue de Paris, 75001 Paris', poste: 'Attaquant', status: 'Actif', phone: '0601020304', email: 'jean.d@email.com', tutorName: 'Jacques Dupont', tutorPhone: '0611223344', photo: 'https://placehold.co/40x40.png' },
  { id: 2, name: 'Marie Curie', birthDate: '2002-03-20', address: '456 Avenue de Lyon, 69002 Lyon', poste: 'Défenseur', status: 'Actif', phone: '0602030405', email: 'marie.c@email.com', tutorName: 'Pierre Curie', tutorPhone: '0622334455', photo: 'https://placehold.co/40x40.png' },
  { id: 3, name: 'Pierre Martin', birthDate: '1996-07-10', address: '789 Boulevard de Marseille, 13008 Marseille', poste: 'Milieu', status: 'Blessé', phone: '0603040506', email: 'pierre.m@email.com', tutorName: 'N/A', tutorPhone: 'N/A', photo: 'https://placehold.co/40x40.png' },
  { id: 4, name: 'Lucas Hernandez', birthDate: '2003-11-05', address: '101 Chemin de la Gloire, 31000 Toulouse', poste: 'Gardien', status: 'Actif', phone: '0604050607', email: 'lucas.h@email.com', tutorName: 'Jean Hernandez', tutorPhone: '0644556677', photo: 'https://placehold.co/40x40.png' },
  { id: 5, name: 'Chloé Dubois', birthDate: '1999-09-25', address: '212 Rue de la Liberté, 44000 Nantes', poste: 'Attaquant', status: 'Suspendu', phone: '0605060708', email: 'chloe.d@email.com', tutorName: 'N/A', tutorPhone: 'N/A', photo: 'https://placehold.co/40x40.png' },
];


export const coaches = [
  { id: 1, name: 'Alain Prost', specialization: 'Équipe principale', status: 'Actif', contact: 'alain.p@email.com' },
  { id: 2, name: 'Sophie Marceau', specialization: 'Équipe jeune', status: 'Actif', contact: 'sophie.m@email.com' },
  { id: 3, name: 'Gérard Depardieu', specialization: 'Entraînement des gardiens', status: 'Actif', contact: 'gerard.d@email.com' },
];

export const calendarEvents = [
  { id: 1, opponent: 'FC Lyon', date: '2024-08-15', time: '18:00', location: 'Stade Local', type: 'Match' },
  { id: 2, opponent: '', date: '2024-08-17', time: '10:00', location: 'Terrain d\'entraînement', type: 'Entraînement' },
  { id: 3, opponent: 'AS Marseille', date: '2024-08-22', time: '20:00', location: 'Stade Vélodrome', type: 'Match' },
];

export const upcomingEvents = calendarEvents.slice(0, 2);

export const results = [
  { id: 1, opponent: 'FC Bordeaux', date: '2024-08-01', score: '3-1', scorers: ['J. Dupont (2)', 'P. Martin'], notes: 'Belle victoire, bonne performance défensive.' },
  { id: 2, opponent: 'Paris SG', date: '2024-07-25', score: '0-2', scorers: [], notes: 'Match difficile contre une équipe solide.' },
  { id: 3, opponent: 'OGC Nice', date: '2024-07-18', score: '2-2', scorers: ['J. Dupont', 'M. Curie'], notes: 'Match nul arraché en fin de partie.' },
];

export const playerPayments = [
  { id: 1, member: 'Jean Dupont', amount: '1500 DH', status: 'payé', dueDate: '2024-09-01' },
  { id: 2, member: 'Marie Curie', amount: '1500 DH', status: 'non payé', dueDate: '2024-09-01' },
  { id: 3, member: 'Pierre Martin', amount: '750 DH', status: 'payé', dueDate: '2024-09-01' },
  { id: 4, member: 'Lucas Hernandez', amount: '1500 DH', status: 'non payé', dueDate: '2024-09-01' },
  { id: 5, member: 'Chloé Dubois', amount: '1500 DH', status: 'partiel', dueDate: '2024-09-01' },
];

const calculateOverview = (payments: { amount: string; status: string }[]) => {
    const totalDue = payments.reduce((acc, p) => acc + parseFloat(p.amount.replace(' DH', '')), 0);
    const paymentsMade = payments
        .filter(p => p.status === 'payé')
        .reduce((acc, p) => acc + parseFloat(p.amount.replace(' DH', '')), 0);
    const paymentsPartial = payments
        .filter(p => p.status === 'partiel')
        .reduce((acc, p) => acc + (parseFloat(p.amount.replace(' DH', '')) / 2), 0); // Assuming partial is 50%
    const totalPaid = paymentsMade + paymentsPartial;
    const paymentsRemaining = totalDue - totalPaid;

    return { totalDue, paymentsMade: totalPaid, paymentsRemaining };
};

export const playerPaymentsOverview = calculateOverview(playerPayments);

export const coachSalaries = [
    { id: 1, member: 'Alain Prost', amount: '20000 DH', status: 'payé', dueDate: '2024-08-31' },
    { id: 2, member: 'Sophie Marceau', amount: '15000 DH', status: 'partiel', dueDate: '2024-08-31' },
    { id: 3, member: 'Gérard Depardieu', amount: '12000 DH', status: 'non payé', dueDate: '2024-08-31' },
];

export const coachSalariesOverview = calculateOverview(coachSalaries);


export const notifications = [
    { id: 1, message: 'Rappel: Inscriptions pour la nouvelle saison ouvertes.', date: '2024-08-10', priority: 'Moyenne' },
    { id: 2, message: 'Le prochain match a été déplacé à 19h.', date: '2024-08-12', priority: 'Haute' },
];
