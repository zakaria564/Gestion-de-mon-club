
"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, writeBatch, where } from "firebase/firestore";
import { useAuth } from "./auth-context";
import type { Coach } from "@/lib/data";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

interface CoachesContextType {
  coaches: Coach[];
  loading: boolean;
  addCoach: (coach: Omit<Coach, 'id' | 'uid'>) => Promise<void>;
  updateCoach: (coach: Coach) => Promise<void>;
  deleteCoach: (id: string) => Promise<void>;
  getCoachById: (id: string) => Coach | undefined;
  fetchCoaches: () => Promise<void>;
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
    getDocs(query(collectionRef))
      .then((snapshot) => {
        setCoaches(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Coach)));
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: collectionRef.path,
          operation: 'list',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setLoading(false));
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
    const newCoachData = { ...coachData, uid: user.uid };
    addDoc(collectionRef, newCoachData)
      .then(() => fetchCoaches())
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: collectionRef.path,
          operation: 'create',
          requestResourceData: newCoachData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const updateCoach = async (coachData: Coach) => {
    if (!user) return;
    const oldCoach = coaches.find(c => c.id === coachData.id);
    if (!oldCoach) return;

    const coachRef = doc(db, "users", user.uid, "coaches", coachData.id);
    const { id, ...dataToUpdate } = coachData;

    updateDoc(coachRef, dataToUpdate)
      .then(async () => {
        if (oldCoach.name !== coachData.name) {
          window.location.reload();
        } else {
          await fetchCoaches();
        }
      })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: coachRef.path,
          operation: 'update',
          requestResourceData: dataToUpdate,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const deleteCoach = async (id: string) => {
    if (!user) return;
    const coachRef = doc(db, "users", user.uid, "coaches", id);
    deleteDoc(coachRef)
      .then(() => fetchCoaches())
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: coachRef.path,
          operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };
  
  const getCoachById = useCallback((id: string) => {
    return coaches.find((coach) => coach.id === id);
  }, [coaches]);

  return (
    <CoachesContext.Provider value={{ coaches, loading, addCoach, updateCoach, deleteCoach, getCoachById, fetchCoaches }}>
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
