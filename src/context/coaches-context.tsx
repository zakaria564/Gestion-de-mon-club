
"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, writeBatch } from "firebase/firestore";
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

export function CoachesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);

  const getCoachesCollection = useCallback(() => {
    if (!user) return null;
    return collection(db, "users", user.uid, "coaches");
  }, [user]);

  const fetchCoaches = useCallback(async () => {
    const collectionRef = getCoachesCollection();
    if (!collectionRef) {
        setCoaches([]);
        setLoading(false);
        return;
    }
    
    setLoading(true);
    try {
        const q = query(collectionRef);
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Coach));
        setCoaches(data);
    } catch (err) {
        console.error("Error fetching coaches: ", err);
    } finally {
        setLoading(false);
    }
  }, [getCoachesCollection]);
  
  useEffect(() => {
    if(user) {
        fetchCoaches();
    } else {
        setCoaches([]);
        setLoading(false);
    }
  }, [user, fetchCoaches]);

  const addCoach = async (coachData: Omit<Coach, 'id' | 'uid'>) => {
    const collectionRef = getCoachesCollection();
    if (!collectionRef || !user) return;
    try {
      const newCoachData = { ...coachData, uid: user.uid };
      await addDoc(collectionRef, newCoachData);
      await fetchCoaches();
    } catch (err) {
      console.error("Error adding coach: ", err);
    }
  };

  const updateCoach = async (coachData: Coach) => {
    if (!user) return;
    const oldCoach = coaches.find(c => c.id === coachData.id);
    if (!oldCoach) return;

    const oldName = oldCoach.name;
    const newName = coachData.name;
    const nameHasChanged = oldName !== newName;

    try {
      const batch = writeBatch(db);

      // 1. Update the coach document itself
      const coachDocRef = doc(db, "users", user.uid, "coaches", coachData.id);
      const { id, ...dataToUpdate } = coachData;
      batch.update(coachDocRef, dataToUpdate);

      if (nameHasChanged) {
        // 2. Update coachSalaries
        const salariesRef = collection(db, "users", user.uid, "coachSalaries");
        const salariesSnap = await getDocs(salariesRef);
        salariesSnap.forEach(salaryDoc => {
          if (salaryDoc.data().member === oldName) {
            batch.update(salaryDoc.ref, { member: newName });
          }
        });

        // 3. Update coachName in players collection
        const playersRef = collection(db, "users", user.uid, "players");
        const playersSnap = await getDocs(playersRef);
        playersSnap.forEach(playerDoc => {
          if (playerDoc.data().coachName === oldName) {
            batch.update(playerDoc.ref, { coachName: newName });
          }
        });
      }

      await batch.commit();
      await fetchCoaches(); // Refetch to update local state

    } catch (err) {
      console.error("Error updating coach and cascading changes: ", err);
    }
  };

  const deleteCoach = async (id: string) => {
    if (!user) return;
    try {
      const coachDoc = doc(db, "users", user.uid, "coaches", id);
      await deleteDoc(coachDoc);
      await fetchCoaches();
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
