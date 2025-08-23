
"use client";

import React, { createContext, useState, useMemo, ReactNode, useEffect, useCallback, useContext } from 'react';
import { Payment, NewPayment, Overview, Transaction } from '@/lib/financial-data';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, doc, QueryDocumentSnapshot, DocumentData, CollectionReference } from 'firebase/firestore';
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

  const getCollectionRef = useCallback((collectionName: 'playerPayments' | 'coachSalaries') => {
      if (!user) return null;
      return collection(db, 'users', user.uid, collectionName);
  }, [user]);

  const fetchPayments = useCallback(async () => {
    if (!user) {
      setPlayerPayments([]);
      setCoachSalaries([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const playerPaymentsCol = getCollectionRef('playerPayments');
      const coachSalariesCol = getCollectionRef('coachSalaries');

      if (!playerPaymentsCol || !coachSalariesCol) {
          setLoading(false);
          return;
      }
      
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
  }, [user, getCollectionRef]);

  useEffect(() => {
    if (user) {
      fetchPayments();
    } else {
        setPlayerPayments([]);
        setCoachSalaries([]);
        setLoading(false);
    }
  }, [user, fetchPayments]);

  const addPayment = async (collectionName: 'playerPayments' | 'coachSalaries', payment: NewPayment) => {
      const collectionRef = getCollectionRef(collectionName);
      if (!collectionRef) return;
      
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
      await fetchPayments();
  };

  const addPlayerPayment = async (payment: NewPayment) => {
    await addPayment('playerPayments', payment);
  };

  const addCoachSalary = async (payment: NewPayment) => {
    await addPayment('coachSalaries', payment);
  };

  const updatePayment = async (collectionName: 'playerPayments' | 'coachSalaries', payments: Payment[], paymentId: string, complementAmount: number) => {
      const collectionRef = getCollectionRef(collectionName);
      if (!collectionRef) return;

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
      await fetchPayments();
  }

  const updatePlayerPayment = async (paymentId: string, complementAmount: number) => {
    await updatePayment('playerPayments', playerPayments, paymentId, complementAmount);
  };

  const updateCoachSalary = async (paymentId: string, complementAmount: number) => {
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
