
"use client";

import React, { createContext, useState, useMemo, ReactNode } from 'react';
import { initialPlayerPayments, initialCoachSalaries, type Payment, type NewPayment, type Overview, type Transaction } from '@/lib/financial-data';

interface FinancialContextType {
  playerPayments: Payment[];
  coachSalaries: Payment[];
  addPlayerPayment: (payment: NewPayment) => void;
  addCoachSalary: (payment: NewPayment) => void;
  updatePlayerPayment: (paymentId: number, complementAmount: number) => void;
  updateCoachSalary: (paymentId: number, complementAmount: number) => void;
  playerPaymentsOverview: Overview;
  coachSalariesOverview: Overview;
}

export const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

const processPayments = (payments: (NewPayment | Payment)[]): Payment[] => {
    return payments.map(p => {
        const paidAmount = 'transactions' in p 
            ? p.transactions.reduce((acc, t) => acc + t.amount, 0)
            : p.initialPaidAmount;

        const transactions: Transaction[] = 'transactions' in p 
            ? p.transactions 
            : p.initialPaidAmount > 0 
                ? [{ id: Date.now(), amount: p.initialPaidAmount, date: new Date().toISOString() }]
                : [];

        const remainingAmount = p.totalAmount - paidAmount;
        const status = remainingAmount <= 0 ? 'payé' : paidAmount > 0 ? 'partiel' : 'non payé';
        
        const basePayment = 'transactions' in p ? p : { id: p.id, member: p.member, totalAmount: p.totalAmount, dueDate: p.dueDate };

        return {
            ...basePayment,
            paidAmount,
            remainingAmount,
            status,
            transactions,
        };
    });
};

const calculateOverview = (payments: Payment[]): Overview => {
    const totalDue = payments.reduce((acc, p) => acc + p.totalAmount, 0);
    const paymentsMade = payments.reduce((acc, p) => acc + p.paidAmount, 0);
    const paymentsRemaining = totalDue - paymentsMade;
    return { totalDue, paymentsMade, paymentsRemaining };
};

export const FinancialProvider = ({ children }: { children: ReactNode }) => {
  const [playerPaymentsState, setPlayerPaymentsState] = useState<Payment[]>(processPayments(initialPlayerPayments));
  const [coachSalariesState, setCoachSalariesState] = useState<Payment[]>(processPayments(initialCoachSalaries));

  const addPlayerPayment = (payment: NewPayment) => {
    setPlayerPaymentsState(prevState => processPayments([...prevState, payment]));
  };

  const addCoachSalary = (payment: NewPayment) => {
    setCoachSalariesState(prevState => processPayments([...prevState, payment]));
  };

  const updatePlayerPayment = (paymentId: number, complementAmount: number) => {
    setPlayerPaymentsState(prevState => {
        const updatedPayments = prevState.map(p => {
            if (p.id === paymentId) {
                const newTransaction: Transaction = {
                    id: Date.now(),
                    amount: complementAmount,
                    date: new Date().toISOString(),
                };
                return { ...p, transactions: [...p.transactions, newTransaction] };
            }
            return p;
        });
        return processPayments(updatedPayments);
    });
  };

  const updateCoachSalary = (paymentId: number, complementAmount: number) => {
    setCoachSalariesState(prevState => {
        const updatedPayments = prevState.map(p => {
            if (p.id === paymentId) {
                 const newTransaction: Transaction = {
                    id: Date.now(),
                    amount: complementAmount,
                    date: new Date().toISOString(),
                };
                return { ...p, transactions: [...p.transactions, newTransaction] };
            }
            return p;
        });
        return processPayments(updatedPayments);
    });
  };

  const playerPaymentsOverview = useMemo(() => calculateOverview(playerPaymentsState), [playerPaymentsState]);
  const coachSalariesOverview = useMemo(() => calculateOverview(coachSalariesState), [coachSalariesState]);

  return (
    <FinancialContext.Provider value={{ 
        playerPayments: playerPaymentsState, 
        coachSalaries: coachSalariesState, 
        addPlayerPayment, 
        addCoachSalary,
        updatePlayerPayment,
        updateCoachSalary,
        playerPaymentsOverview,
        coachSalariesOverview
    }}>
      {children}
    </FinancialContext.Provider>
  );
};
