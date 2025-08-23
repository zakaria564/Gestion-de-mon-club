
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, doc, runTransaction } from "firebase/firestore";
import { useAuth } from "./auth-context";
import type { Payment, NewPayment, Transaction, Overview } from "@/lib/financial-data";

interface FinancialContextType {
  playerPayments: Payment[];
  coachSalaries: Payment[];
  loading: boolean;
  addPlayerPayment: (payment: NewPayment) => Promise<void>;
  addCoachSalary: (payment: NewPayment) => Promise<void>;
  updatePlayerPayment: (id: string, newAmount: number) => Promise<void>;
  updateCoachSalary: (id: string, newAmount: number) => Promise<void>;
  playerPaymentsOverview: Overview;
  coachSalariesOverview: Overview;
  getPlayerPaymentById: (id: string) => Payment | undefined;
  getCoachSalaryById: (id: string) => Payment | undefined;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export function FinancialProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [playerPayments, setPlayerPayments] = useState<Payment[]>([]);
  const [coachSalaries, setCoachSalaries] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const getPlayerPaymentsCollectionRef = useCallback(() => {
    if (!user) return null;
    return collection(db, "users", user.uid, "playerPayments");
  }, [user]);
  
  const getCoachSalariesCollectionRef = useCallback(() => {
    if (!user) return null;
    return collection(db, "users", user.uid, "coachSalaries");
  }, [user]);

  const fetchPayments = useCallback(async () => {
    const playerPaymentsRef = getPlayerPaymentsCollectionRef();
    const coachSalariesRef = getCoachSalariesCollectionRef();
    
    if (!playerPaymentsRef || !coachSalariesRef) {
      setPlayerPayments([]);
      setCoachSalaries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [playerSnapshot, coachSnapshot] = await Promise.all([
        getDocs(playerPaymentsRef),
        getDocs(coachSalariesRef)
      ]);
      const playerData = playerSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Payment));
      const coachData = coachSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Payment));
      setPlayerPayments(playerData);
      setCoachSalaries(coachData);
    } catch (err) {
      console.error("Error fetching payments:", err);
    } finally {
      setLoading(false);
    }
  }, [getPlayerPaymentsCollectionRef, getCoachSalariesCollectionRef]);

  useEffect(() => {
    if (user) {
      fetchPayments();
    } else {
      setPlayerPayments([]);
      setCoachSalaries([]);
      setLoading(false);
    }
  }, [user, fetchPayments]);

  const calculateStatus = (total: number, paid: number): 'payé' | 'non payé' | 'partiel' => {
    if (paid >= total) return 'payé';
    if (paid === 0) return 'non payé';
    return 'partiel';
  };

  const addPayment = async (collectionName: 'playerPayments' | 'coachSalaries', paymentData: NewPayment) => {
    if (!user) return;
    const collectionRef = collection(db, "users", user.uid, collectionName);
    try {
      const { member, totalAmount, initialPaidAmount, dueDate } = paymentData;
      const status = calculateStatus(totalAmount, initialPaidAmount);
      
      const newTransaction: Transaction = {
        id: Date.now(),
        amount: initialPaidAmount,
        date: new Date().toISOString()
      };

      const newPayment: Omit<Payment, 'id'> = {
        member,
        totalAmount,
        paidAmount: initialPaidAmount,
        remainingAmount: totalAmount - initialPaidAmount,
        status,
        dueDate,
        transactions: initialPaidAmount > 0 ? [newTransaction] : []
      };

      await addDoc(collectionRef, newPayment);
      fetchPayments();
    } catch (err) {
      console.error(`Error adding ${collectionName}: `, err);
    }
  };

  const updatePayment = async (collectionName: 'playerPayments' | 'coachSalaries', id: string, newAmount: number) => {
      if (!user) return;
      const docRef = doc(db, "users", user.uid, collectionName, id);

      try {
        await runTransaction(db, async (transaction) => {
            const paymentDoc = await transaction.get(docRef);
            if (!paymentDoc.exists()) {
                throw "Document does not exist!";
            }

            const oldData = paymentDoc.data() as Payment;
            const newPaidAmount = oldData.paidAmount + newAmount;
            const newRemainingAmount = oldData.totalAmount - newPaidAmount;
            const newStatus = calculateStatus(oldData.totalAmount, newPaidAmount);

            const newTransaction: Transaction = {
                id: Date.now(),
                amount: newAmount,
                date: new Date().toISOString(),
            };

            const updatedTransactions = [...oldData.transactions, newTransaction];

            transaction.update(docRef, { 
                paidAmount: newPaidAmount,
                remainingAmount: newRemainingAmount,
                status: newStatus,
                transactions: updatedTransactions
            });
        });
        fetchPayments();
    } catch (err) {
        console.error(`Error updating ${collectionName}:`, err);
    }
  };

  const addPlayerPayment = (payment: NewPayment) => addPayment('playerPayments', payment);
  const addCoachSalary = (payment: NewPayment) => addPayment('coachSalaries', payment);
  const updatePlayerPayment = (id: string, newAmount: number) => updatePayment('playerPayments', id, newAmount);
  const updateCoachSalary = (id: string, newAmount: number) => updatePayment('coachSalaries', id, newAmount);

  const calculateOverview = (payments: Payment[]): Overview => {
    return payments.reduce((acc, p) => {
        acc.totalDue += p.totalAmount;
        acc.paymentsMade += p.paidAmount;
        acc.paymentsRemaining += p.remainingAmount;
        return acc;
    }, { totalDue: 0, paymentsMade: 0, paymentsRemaining: 0 });
  };
  
  const getPlayerPaymentById = useCallback((id: string) => {
    return playerPayments.find((p) => p.id === id);
  }, [playerPayments]);

  const getCoachSalaryById = useCallback((id: string) => {
    return coachSalaries.find((s) => s.id === id);
  }, [coachSalaries]);

  return (
    <FinancialContext.Provider value={{ 
      playerPayments, 
      coachSalaries, 
      loading, 
      addPlayerPayment, 
      addCoachSalary,
      updatePlayerPayment,
      updateCoachSalary,
      playerPaymentsOverview: calculateOverview(playerPayments),
      coachSalariesOverview: calculateOverview(coachSalaries),
      getPlayerPaymentById,
      getCoachSalaryById
    }}>
      {children}
    </FinancialContext.Provider>
  );
}

export const useFinancialContext = () => {
    const context = useContext(FinancialContext);
    if (context === undefined) {
        throw new Error("useFinancialContext must be used within a FinancialProvider");
    }
    return context;
};
