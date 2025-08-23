
export type Payment = {
    id: number;
    member: string;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    status: 'payé' | 'non payé' | 'partiel';
    dueDate: string;
};

export type NewPayment = Omit<Payment, 'remainingAmount' | 'status'>;

export type Overview = {
    totalDue: number;
    paymentsMade: number;
    paymentsRemaining: number;
};

export const initialPlayerPayments: NewPayment[] = [
  { id: 1, member: 'Jean Dupont', totalAmount: 1500, paidAmount: 1500, dueDate: '2024-09-01' },
  { id: 2, member: 'Marie Curie', totalAmount: 1500, paidAmount: 0, dueDate: '2024-09-01' },
  { id: 3, member: 'Pierre Martin', totalAmount: 1500, paidAmount: 750, dueDate: '2024-09-01' },
  { id: 4, member: 'Lucas Hernandez', totalAmount: 1500, paidAmount: 0, dueDate: '2024-09-01' },
  { id: 5, member: 'Chloé Dubois', totalAmount: 1500, paidAmount: 750, dueDate: '2024-09-01' },
];

export const initialCoachSalaries: NewPayment[] = [
    { id: 1, member: 'Alain Prost', totalAmount: 20000, paidAmount: 20000, dueDate: '2024-08-31' },
    { id: 2, member: 'Sophie Marceau', totalAmount: 15000, paidAmount: 7500, dueDate: '2024-08-31' },
    { id: 3, member: 'Gérard Depardieu', totalAmount: 12000, paidAmount: 0, dueDate: '2024-08-31' },
];
