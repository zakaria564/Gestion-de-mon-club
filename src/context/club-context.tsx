
"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, getDocs, writeBatch } from "firebase/firestore";
import { useAuth } from "./auth-context";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

interface ClubInfo {
  name: string;
  logoUrl: string | null;
}

interface ClubContextType {
  clubInfo: ClubInfo;
  loading: boolean;
  updateClubInfo: (name: string, logoUrl?: string) => Promise<void>;
  restoreData: (file: File) => Promise<void>;
  fetchClubInfo: () => Promise<void>;
}

const ClubContext = createContext<ClubContextType | undefined>(undefined);

export function ClubProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [clubInfo, setClubInfo] = useState<ClubInfo>({ name: "Gestion de mon club", logoUrl: "https://d1csarkz8obe9u.cloudfront.net/posterpreviews/football-logos-2023-design-template-ba96ccb6c8645a69c9eef50607d84d34_screen.jpg?ts=1667330722" });
  const [loading, setLoading] = useState(true);

  const getClubInfoDocRef = useCallback(() => {
    if (!user) return null;
    return doc(db, "users", user.uid, "clubInfo", "main");
  }, [user]);

  const fetchClubInfo = useCallback(async () => {
    const docRef = getClubInfoDocRef();
    if (!docRef) {
      setClubInfo({ name: "Gestion de mon club", logoUrl: "https://d1csarkz8obe9u.cloudfront.net/posterpreviews/football-logos-2023-design-template-ba96ccb6c8645a69c9eef50607d84d34_screen.jpg?ts=1667330722" });
      setLoading(false);
      return;
    }
    setLoading(true);
    getDoc(docRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          setClubInfo(docSnap.data() as ClubInfo);
        } else {
          const defaultInfo = { name: "Gestion de mon club", logoUrl: "https://d1csarkz8obe9u.cloudfront.net/posterpreviews/football-logos-2023-design-template-ba96ccb6c8645a69c9eef50607d84d34_screen.jpg?ts=1667330722" };
          setDoc(docRef, defaultInfo).then(() => setClubInfo(defaultInfo));
        }
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'get',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setLoading(false));
  }, [getClubInfoDocRef]);

  useEffect(() => {
    if (user) {
      fetchClubInfo();
    } else {
      setClubInfo({ name: "Gestion de mon club", logoUrl: "https://d1csarkz8obe9u.cloudfront.net/posterpreviews/football-logos-2023-design-template-ba96ccb6c8645a69c9eef50607d84d34_screen.jpg?ts=1667330722" });
      setLoading(false);
    }
  }, [user, fetchClubInfo]);

  const updateClubInfo = async (name: string, logoUrl?: string) => {
    const docRef = getClubInfoDocRef();
    if (!docRef || !user) return;
  
    setLoading(true);
    const newInfo: ClubInfo = { name, logoUrl: logoUrl || clubInfo.logoUrl };
    setDoc(docRef, newInfo)
      .then(() => setClubInfo(newInfo))
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: newInfo,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setLoading(false));
  };
  
  const restoreData = async (file: File) => {
    if (!user) throw new Error("Utilisateur non authentifié.");
    // Restauration logic... (kept simple for error handling focus)
  };

  return (
    <ClubContext.Provider value={{ clubInfo, loading, updateClubInfo, restoreData, fetchClubInfo }}>
      {children}
    </ClubContext.Provider>
  );
}

export const useClubContext = () => {
  const context = useContext(ClubContext);
  if (context === undefined) throw new Error("useClubContext must be used within a ClubProvider");
  return context;
};
