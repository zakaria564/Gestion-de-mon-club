
"use client";

import React, { createContext, useState, useMemo, ReactNode } from 'react';
import { initialPlayerPayments, initialCoachSalaries, type Payment, type NewPayment, type Overview } from '@/lib/financial-data';

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

const processPayments = (payments: NewPayment[]): Payment[] => {
    return payments.map(p => {
        const remainingAmount = p.totalAmount - p.paidAmount;
        const status = remainingAmount <= 0 ? 'payé' : p.paidAmount > 0 ? 'partiel' : 'non payé';
        return {
            ...p,
            remainingAmount,
            status
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
                return { ...p, paidAmount: p.paidAmount + complementAmount };
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
                return { ...p, paidAmount: p.paidAmount + complementAmount };
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
