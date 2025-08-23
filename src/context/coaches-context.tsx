
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { useAuth } from "./auth-context";
import type { Coach } from "@/lib/data";

interface CoachesContextType {
  coaches: Coach[];
  loading: boolean;
  addCoach: (coach: Omit<Coach, 'id'>) => Promise<void>;
  updateCoach: (coach: Coach) => Promise<void>;
  deleteCoach: (id: string) => Promise<void>;
  getCoachById: (id: string) => Coach | undefined;
}

const CoachesContext = createContext<CoachesContextType | undefined>(undefined);

export function CoachesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCoaches = useCallback(async () => {
    if (!user) {
        setCoaches([]);
        setLoading(false);
        return;
    }
    setLoading(true);
    try {
      const collectionRef = collection(db, "users", user.uid, "coaches");
      const snapshot = await getDocs(collectionRef);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Coach));
      setCoaches(data);
    } catch (err) {
      console.error("Error fetching coaches: ", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchCoaches();
    } else {
      setCoaches([]);
      setLoading(false);
    }
  }, [user, fetchCoaches]);

  const addCoach = async (coachData: Omit<Coach, 'id'>) => {
    if (!user) return;
    try {
      const collectionRef = collection(db, "users", user.uid, "coaches");
      const newCoachData = { ...coachData, uid: user.uid };
      await addDoc(collectionRef, newCoachData);
      fetchCoaches();
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
      fetchCoaches();
    } catch (err) {
      console.error("Error updating coach: ", err);
    }
  };

  const deleteCoach = async (id: string) => {
    if (!user) return;
    try {
      const coachDoc = doc(db, "users", user.uid, "coaches", id);
      await deleteDoc(coachDoc);
      fetchCoaches();
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
