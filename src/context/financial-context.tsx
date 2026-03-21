
"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc, runTransaction, getDocs, query, deleteDoc } from "firebase/firestore";
import { useAuth } from "./auth-context";
import type { Payment, NewPayment, Transaction, Overview } from "@/lib/financial-data";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

interface FinancialContextType {
  playerPayments: Payment[];
  coachSalaries: Payment[];
  loading: boolean;
  addPlayerPayment: (payment: NewPayment) => Promise<void>;
  addCoachSalary: (payment: NewPayment) => Promise<void>;
  updatePlayerPayment: (id: string, newAmount: number) => Promise<void>;
  updateCoachSalary: (id: string, newAmount: number) => Promise<void>;
  deletePlayerPayment: (id: string) => Promise<void>;
  deleteCoachSalary: (id: string) => Promise<void>;
  playerPaymentsOverview: Overview;
  coachSalariesOverview: Overview;
  getPlayerPaymentById: (id: string) => Payment | undefined;
  getCoachSalaryById: (id: string) => Payment | undefined;
  fetchFinancialData: () => Promise<void>;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export function FinancialProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [playerPayments, setPlayerPayments] = useState<Payment[]>([]);
  const [coachSalaries, setCoachSalaries] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const getPlayerPaymentsCollection = useCallback(() => {
    if (!user) return null;
    return collection(db, "users", user.uid, "playerPayments");
  }, [user]);

  const getCoachSalariesCollection = useCallback(() => {
    if (!user) return null;
    return collection(db, "users", user.uid, "coachSalaries");
  }, [user]);

  const fetchFinancialData = useCallback(async () => {
    if (!user) {
        setPlayerPayments([]);
        setCoachSalaries([]);
        setLoading(false);
        return;
    }
    setLoading(true);
    const playerPaymentsRef = getPlayerPaymentsCollection();
    const coachSalariesRef = getCoachSalariesCollection();

    const fetchPlayers = playerPaymentsRef ? getDocs(query(playerPaymentsRef)) : Promise.resolve({ docs: [] });
    const fetchCoaches = coachSalariesRef ? getDocs(query(coachSalariesRef)) : Promise.resolve({ docs: [] });

    Promise.all([fetchPlayers, fetchCoaches])
      .then(([playerSnap, coachSnap]) => {
        setPlayerPayments(playerSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Payment)));
        setCoachSalaries(coachSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Payment)));
      })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: playerPaymentsRef?.path || "financialData",
          operation: 'list',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setLoading(false));
  }, [user, getPlayerPaymentsCollection, getCoachSalariesCollection]);
  
  useEffect(() => {
    if(user) {
        fetchFinancialData();
    } else {
        setPlayerPayments([]);
        setCoachSalaries([]);
        setLoading(false);
    }
  }, [user, fetchFinancialData]);


  const calculateStatus = (total: number, paid: number): 'payé' | 'non payé' | 'partiel' => {
    if (paid >= total) return 'payé';
    if (paid <= 0) return 'non payé';
    return 'partiel';
  };

  const addPayment = async (collectionRef: any, paymentData: NewPayment) => {
    if (!collectionRef || !user) return;
    const { member, totalAmount, initialPaidAmount, dueDate } = paymentData;
    const status = calculateStatus(totalAmount, initialPaidAmount);
    
    const newTransaction: Transaction = { id: Date.now(), amount: initialPaidAmount, date: new Date().toISOString() };
    const newPaymentData = {
      member, totalAmount, paidAmount: initialPaidAmount, remainingAmount: totalAmount - initialPaidAmount,
      status, dueDate, date: new Date().toISOString(), transactions: initialPaidAmount > 0 ? [newTransaction] : [], uid: user.uid
    };

    addDoc(collectionRef, newPaymentData)
      .then(() => fetchFinancialData())
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: collectionRef.path,
          operation: 'create',
          requestResourceData: newPaymentData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const updatePayment = async (collectionName: 'playerPayments' | 'coachSalaries', id: string, newAmount: number) => {
      if (!user) return;
      const docRef = doc(db, "users", user.uid, collectionName, id);
      runTransaction(db, async (transaction) => {
          const paymentDoc = await transaction.get(docRef);
          if (!paymentDoc.exists()) throw "Document does not exist!";
          const oldData = paymentDoc.data() as Payment;
          const newPaidAmount = oldData.paidAmount + newAmount;
          const newRemainingAmount = oldData.totalAmount - newPaidAmount;
          const newStatus = calculateStatus(oldData.totalAmount, newPaidAmount);
          const newTransaction: Transaction = { id: Date.now(), amount: newAmount, date: new Date().toISOString() };
          const updatedTransactions = [...oldData.transactions, newTransaction];
          transaction.update(docRef, { paidAmount: newPaidAmount, remainingAmount: newRemainingAmount, status: newStatus, transactions: updatedTransactions });
      })
      .then(() => fetchFinancialData())
      .catch(async (err) => {
          const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: { newAmount },
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
      });
  };

  const deletePayment = async (collectionName: 'playerPayments' | 'coachSalaries', id: string) => {
    if (!user) return;
    const docRef = doc(db, "users", user.uid, collectionName, id);
    deleteDoc(docRef)
      .then(() => fetchFinancialData())
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  return (
    <FinancialContext.Provider value={{ 
      playerPayments, coachSalaries, loading, 
      addPlayerPayment: (p) => addPayment(getPlayerPaymentsCollection(), p),
      addCoachSalary: (p) => addPayment(getCoachSalariesCollection(), p),
      updatePlayerPayment: (id, amt) => updatePayment('playerPayments', id, amt),
      updateCoachSalary: (id, amt) => updatePayment('coachSalaries', id, amt),
      deletePlayerPayment: (id) => deletePayment('playerPayments', id),
      deleteCoachSalary: (id) => deletePayment('coachSalaries', id),
      playerPaymentsOverview: {
        totalDue: playerPayments.reduce((s, p) => s + p.totalAmount, 0),
        paymentsMade: playerPayments.reduce((s, p) => s + p.paidAmount, 0),
        paymentsRemaining: playerPayments.reduce((s, p) => s + p.remainingAmount, 0)
      },
      coachSalariesOverview: {
        totalDue: coachSalaries.reduce((s, p) => s + p.totalAmount, 0),
        paymentsMade: coachSalaries.reduce((s, p) => s + p.paidAmount, 0),
        paymentsRemaining: coachSalaries.reduce((s, p) => s + p.remainingAmount, 0)
      },
      getPlayerPaymentById: (id) => playerPayments.find(p => p.id === id),
      getCoachSalaryById: (id) => coachSalaries.find(s => s.id === id),
      fetchFinancialData
    }}>
      {children}
    </FinancialContext.Provider>
  );
}

export const useFinancialContext = () => {
    const context = useContext(FinancialContext);
    if (context === undefined) throw new Error("useFinancialContext must be used within a FinancialProvider");
    return context;
};
