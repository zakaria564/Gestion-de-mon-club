
"use client";

import React, { createContext, useState, useMemo, ReactNode, useEffect, useCallback } from 'react';
import { Payment, NewPayment, Overview, Transaction } from '@/lib/financial-data';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, doc, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { useAuth } from './auth-context';

interface FinancialContextType {
  playerPayments: Payment[];
  coachSalaries: Payment[];
  loading: boolean;
  addPlayerPayment: (payment: NewPayment) => Promise<void>;
  addCoachSalary: (payment: NewPayment) => Promise<void>;
  updatePlayerPayment: (paymentId: string, complementAmount: number) => Promise<void>;
  updateCoachSalary: (paymentId: string, complementAmount: number) => Promise<void>;
  playerPaymentsOverview: Overview;
  coachSalariesOverview: Overview;
}

export const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

const paymentFromDoc = (doc: QueryDocumentSnapshot<DocumentData>): Payment => {
    const data = doc.data();
    const paidAmount = data.transactions.reduce((acc: number, t: Transaction) => acc + t.amount, 0);
    const remainingAmount = data.totalAmount - paidAmount;
    const status = remainingAmount <= 0 ? 'payé' : paidAmount > 0 ? 'partiel' : 'non payé';

    return {
        id: doc.id,
        member: data.member,
        totalAmount: data.totalAmount,
        paidAmount,
        remainingAmount,
        status,
        dueDate: data.dueDate,
        transactions: data.transactions,
    };
}

const calculateOverview = (payments: Payment[]): Overview => {
    const totalDue = payments.reduce((acc, p) => acc + p.totalAmount, 0);
    const paymentsMade = payments.reduce((acc, p) => acc + p.paidAmount, 0);
    const paymentsRemaining = totalDue - paymentsMade;
    return { totalDue, paymentsMade, paymentsRemaining };
};

export const FinancialProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [playerPayments, setPlayerPayments] = useState<Payment[]>([]);
  const [coachSalaries, setCoachSalaries] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = useCallback(async (currentUser) => {
    if (!currentUser) {
      setPlayerPayments([]);
      setCoachSalaries([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const playerPaymentsCol = collection(db, 'users', currentUser.uid, 'playerPayments');
      const coachSalariesCol = collection(db, 'users', currentUser.uid, 'coachSalaries');

      const [playerPaymentsSnapshot, coachSalariesSnapshot] = await Promise.all([
        getDocs(playerPaymentsCol),
        getDocs(coachSalariesCol)
      ]);

      setPlayerPayments(playerPaymentsSnapshot.docs.map(paymentFromDoc));
      setCoachSalaries(coachSalariesSnapshot.docs.map(paymentFromDoc));

    } catch (error) {
      console.error("Error fetching payments:", error);
      setPlayerPayments([]);
      setCoachSalaries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchPayments(user);
    } else {
        setPlayerPayments([]);
        setCoachSalaries([]);
        setLoading(false);
    }
  }, [user, fetchPayments]);

  const addPayment = async (collectionName: 'playerPayments' | 'coachSalaries', payment: NewPayment) => {
      if (!user) return;
      const collectionRef = collection(db, 'users', user.uid, collectionName);
      
      const { member, totalAmount, initialPaidAmount, dueDate } = payment;
      const newTransaction: Transaction | undefined = initialPaidAmount > 0 ? {
          id: Date.now(),
          amount: initialPaidAmount,
          date: new Date().toISOString(),
      } : undefined;

      await addDoc(collectionRef, {
          member,
          totalAmount,
          dueDate,
          transactions: newTransaction ? [newTransaction] : []
      });
      await fetchPayments(user);
  };

  const addPlayerPayment = async (payment: NewPayment) => {
    if (!user) return;
    await addPayment('playerPayments', payment);
  };

  const addCoachSalary = async (payment: NewPayment) => {
    if (!user) return;
    await addPayment('coachSalaries', payment);
  };

  const updatePayment = async (collectionName: 'playerPayments' | 'coachSalaries', payments: Payment[], paymentId: string, complementAmount: number) => {
      if (!user) return;
      const collectionRef = collection(db, 'users', user.uid, collectionName);

      const payment = payments.find(p => p.id === paymentId);
      if (!payment) return;

      const newTransaction: Transaction = {
        id: Date.now(),
        amount: complementAmount,
        date: new Date().toISOString(),
      };
      
      const paymentRef = doc(collectionRef, paymentId);
      await updateDoc(paymentRef, {
          transactions: [...payment.transactions, newTransaction]
      });
      await fetchPayments(user);
  }

  const updatePlayerPayment = async (paymentId: string, complementAmount: number) => {
    if (!user) return;
    await updatePayment('playerPayments', playerPayments, paymentId, complementAmount);
  };

  const updateCoachSalary = async (paymentId: string, complementAmount: number) => {
    if (!user) return;
    await updatePayment('coachSalaries', coachSalaries, paymentId, complementAmount);
  };

  const playerPaymentsOverview = useMemo(() => calculateOverview(playerPayments), [playerPayments]);
  const coachSalariesOverview = useMemo(() => calculateOverview(coachSalaries), [coachSalaries]);

  return (
    <FinancialContext.Provider value={{ 
        playerPayments, 
        coachSalaries, 
        loading,
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
