
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query } from "firebase/firestore";
import { useAuth } from "./auth-context";
import type { Coach } from "@/lib/data";

interface CoachesContextType {
  coaches: Coach[];
  loading: boolean;
  addCoach: (coach: Omit<Coach, 'id' | 'uid'>) => Promise<void>;
  updateCoach: (coach: Coach) => Promise<void>;
  deleteCoach: (id: string) => Promise<void>;
  getCoachById: (id: string) => Coach | undefined;
}

const CoachesContext = createContext<CoachesContextType | undefined>(undefined);

export function CoachesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);

  const getCoachesCollection = useCallback(() => {
    if (!user) return null;
    return collection(db, "users", user.uid, "coaches");
  }, [user]);

  useEffect(() => {
    const collectionRef = getCoachesCollection();
    if (!collectionRef) {
        setCoaches([]);
        setLoading(false);
        return;
    }
    
    const q = query(collectionRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Coach));
        setCoaches(data);
        setLoading(false);
    }, (err) => {
        console.error("Error fetching coaches: ", err);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, getCoachesCollection]);

  const addCoach = async (coachData: Omit<Coach, 'id' | 'uid'>) => {
    const collectionRef = getCoachesCollection();
    if (!collectionRef || !user) return;
    try {
      const newCoachData = { ...coachData, uid: user.uid };
      await addDoc(collectionRef, newCoachData);
    } catch (err) {
      console.error("Error adding coach: ", err);
    }
  };

  const updateCoach = async (coachData: Coach) => {
    if (!user) return;
    try {
      const coachDoc = doc(db, "users", user.uid, "coaches", coachData.id);
      const { id, ...dataToUpdate } = coachData;
      await updateDoc(coachDoc, dataToUpdate);
    } catch (err) {
      console.error("Error updating coach: ", err);
    }
  };

  const deleteCoach = async (id: string) => {
    if (!user) return;
    try {
      const coachDoc = doc(db, "users", user.uid, "coaches", id);
      await deleteDoc(coachDoc);
    } catch (err) {
      console.error("Error deleting coach: ", err);
    }
  };
  
  const getCoachById = useCallback((id: string) => {
    return coaches.find((coach) => coach.id === id);
  }, [coaches]);

  return (
    <CoachesContext.Provider value={{ coaches, loading, addCoach, updateCoach, deleteCoach, getCoachById }}>
      {children}
    </CoachesContext.Provider>
  );
}

export const useCoachesContext = () => {
    const context = useContext(CoachesContext);
    if (context === undefined) {
        throw new Error("useCoachesContext must be used within a CoachesProvider");
    }
    return context;
};
