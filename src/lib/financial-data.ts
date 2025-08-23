
export type Transaction = {
    id: number;
    amount: number;
    date: string;
};

export type Payment = {
    id: string;
    uid: string;
    member: string;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    status: 'payé' | 'non payé' | 'partiel';
    dueDate: string;
    transactions: Transaction[];
};

export type NewPayment = {
    member: string;
    totalAmount: number;
    initialPaidAmount: number;
    dueDate: string;
};

export type Overview = {
    totalDue: number;
    paymentsMade: number;
    paymentsRemaining: number;
};
