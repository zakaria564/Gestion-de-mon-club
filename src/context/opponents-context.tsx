
"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query } from "firebase/firestore";
import { useAuth } from "./auth-context";

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
    try {
        const q = query(collectionRef);
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Opponent));
        setOpponents(data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
        console.error("Error fetching opponents: ", err);
    } finally {
        setLoading(false);
    }
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
    try {
      const newOpponentData = { ...opponentData, uid: user.uid };
      await addDoc(collectionRef, newOpponentData);
      await fetchOpponents();
    } catch (err) {
      console.error("Error adding opponent: ", err);
    }
  };

  const updateOpponent = async (opponentData: Opponent) => {
    if (!user) return;
    try {
      const opponentDoc = doc(db, "users", user.uid, "opponents", opponentData.id);
      const { id, ...dataToUpdate } = opponentData;
      await updateDoc(opponentDoc, dataToUpdate);
      await fetchOpponents();
    } catch (err) {
      console.error("Error updating opponent: ", err);
    }
  };

  const deleteOpponent = async (id: string) => {
    if (!user) return;
    try {
      const opponentDoc = doc(db, "users", user.uid, "opponents", id);
      await deleteDoc(opponentDoc);
      await fetchOpponents();
    } catch (err) {
      console.error("Error deleting opponent: ", err);
    }
  };

  return (
    <OpponentsContext.Provider value={{ opponents, loading, addOpponent, updateOpponent, deleteOpponent }}>
      {children}
    </OpponentsContext.Provider>
  );
}

export const useOpponentsContext = () => {
    const context = useContext(OpponentsContext);
    if (context === undefined) {
        throw new Error("useOpponentsContext must be used within an OpponentsProvider");
    }
    return context;
};
