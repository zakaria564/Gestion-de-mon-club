
"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query } from "firebase/firestore";
import { useAuth } from "./auth-context";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

export interface Opponent {
  id: string;
  uid: string;
  name: string;
  logoUrl?: string;
  gender: 'Masculin' | 'Féminin';
}

export type NewOpponent = Omit<Opponent, 'id' | 'uid'>;

interface OpponentsContextType {
  opponents: Opponent[];
  loading: boolean;
  addOpponent: (opponent: NewOpponent) => Promise<void>;
  updateOpponent: (opponent: Opponent) => Promise<void>;
  deleteOpponent: (id: string) => Promise<void>;
  fetchOpponents: () => Promise<void>;
}

const OpponentsContext = createContext<OpponentsContextType | undefined>(undefined);

export function OpponentsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [loading, setLoading] = useState(true);

  const getOpponentsCollection = useCallback(() => {
    if (!user) return null;
    return collection(db, "users", user.uid, "opponents");
  }, [user]);

  const fetchOpponents = useCallback(async () => {
    const collectionRef = getOpponentsCollection();
    if (!collectionRef) {
        setOpponents([]);
        setLoading(false);
        return;
    }
    
    setLoading(true);
    getDocs(query(collectionRef))
      .then((snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Opponent));
        setOpponents(data.sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: collectionRef.path,
          operation: 'list',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setLoading(false));
  }, [getOpponentsCollection]);
  
  useEffect(() => {
    if(user) {
        fetchOpponents();
    } else {
        setOpponents([]);
        setLoading(false);
    }
  }, [user, fetchOpponents]);

  const addOpponent = async (opponentData: NewOpponent) => {
    const collectionRef = getOpponentsCollection();
    if (!collectionRef || !user) return;
    const newDocData = { ...opponentData, uid: user.uid };
    addDoc(collectionRef, newDocData)
      .then(() => fetchOpponents())
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: collectionRef.path,
          operation: 'create',
          requestResourceData: newDocData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const updateOpponent = async (opponentData: Opponent) => {
    if (!user) return;
    const opponentDoc = doc(db, "users", user.uid, "opponents", opponentData.id);
    const { id, ...dataToUpdate } = opponentData;
    updateDoc(opponentDoc, dataToUpdate)
      .then(() => fetchOpponents())
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: opponentDoc.path,
          operation: 'update',
          requestResourceData: dataToUpdate,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const deleteOpponent = async (id: string) => {
    if (!user) return;
    const opponentDoc = doc(db, "users", user.uid, "opponents", id);
    deleteDoc(opponentDoc)
      .then(() => fetchOpponents())
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: opponentDoc.path,
          operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  return (
    <OpponentsContext.Provider value={{ opponents, loading, addOpponent, updateOpponent, deleteOpponent, fetchOpponents }}>
      {children}
    </OpponentsContext.Provider>
  );
}

export const useOpponentsContext = () => {
    const context = useContext(OpponentsContext);
    if (context === undefined) throw new Error("useOpponentsContext must be used within an OpponentsProvider");
    return context;
};
