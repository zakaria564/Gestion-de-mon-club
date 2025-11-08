
"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, getDocs, writeBatch } from "firebase/firestore";
import { useAuth } from "./auth-context";

interface ClubInfo {
  name: string;
  logoUrl: string | null;
}

interface ClubContextType {
  clubInfo: ClubInfo;
  loading: boolean;
  updateClubInfo: (name: string, logoUrl?: string) => Promise<void>;
  restoreData: (file: File) => Promise<void>;
}

const ClubContext = createContext<ClubContextType | undefined>(undefined);

export function ClubProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [clubInfo, setClubInfo] = useState<ClubInfo>({ name: "USDS", logoUrl: "https://image.noelshack.com/fichiers/2025/45/6/1762611845-images-2.jpeg" });
  const [loading, setLoading] = useState(true);

  const getClubInfoDocRef = useCallback(() => {
    if (!user) return null;
    return doc(db, "users", user.uid, "clubInfo", "main");
  }, [user]);

  const fetchClubInfo = useCallback(async () => {
    const docRef = getClubInfoDocRef();
    if (!docRef) {
      setClubInfo({ name: "USDS", logoUrl: "https://image.noelshack.com/fichiers/2025/45/6/1762611845-images-2.jpeg" });
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setClubInfo(docSnap.data() as ClubInfo);
      } else {
        const defaultInfo = { name: "USDS", logoUrl: "https://image.noelshack.com/fichiers/2025/45/6/1762611845-images-2.jpeg" };
        await setDoc(docRef, defaultInfo);
        setClubInfo(defaultInfo);
      }
    } catch (err) {
      console.error("Error fetching club info: ", err);
    } finally {
      setLoading(false);
    }
  }, [getClubInfoDocRef]);

  useEffect(() => {
    if (user) {
      fetchClubInfo();
    } else {
      setClubInfo({ name: "USDS", logoUrl: "https://image.noelshack.com/fichiers/2025/45/6/1762611845-images-2.jpeg" });
      setLoading(false);
    }
  }, [user, fetchClubInfo]);

  const updateClubInfo = async (name: string, logoUrl?: string) => {
    const docRef = getClubInfoDocRef();
    if (!docRef || !user) return;
  
    setLoading(true);
    try {
      const newInfo: ClubInfo = {
        name: name,
        logoUrl: logoUrl || clubInfo.logoUrl,
      };
      await setDoc(docRef, newInfo);
      setClubInfo(newInfo);
    } catch (err) {
      console.error("Error updating club info: ", err);
    } finally {
      setLoading(false);
    }
  };
  
  const restoreData = async (file: File) => {
    if (!user) throw new Error("Utilisateur non authentifié.");
  
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
  
          const requiredKeys = ['players', 'coaches', 'calendarEvents', 'playerPayments', 'coachSalaries', 'results', 'clubInfo', 'opponents'];
          for (const key of requiredKeys) {
            if (!data.hasOwnProperty(key)) {
              throw new Error(`Le fichier de sauvegarde est invalide. La clé manquante: ${key}`);
            }
          }
  
          const collections: { [key: string]: any[] } = {
            players: data.players,
            coaches: data.coaches,
            calendarEvents: data.calendarEvents,
            playerPayments: data.playerPayments,
            coachSalaries: data.coachSalaries,
            results: data.results,
            opponents: data.opponents,
          };
  
          const batch = writeBatch(db);
  
          for (const collectionName in collections) {
            const collectionRef = collection(db, "users", user.uid, collectionName);
            const snapshot = await getDocs(collectionRef);
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
          }
          
          for (const collectionName in collections) {
            const items = collections[collectionName];
            if (Array.isArray(items)) {
              for (const item of items) {
                  const { id, ...itemData } = item;
                  const newDocRef = doc(collection(db, "users", user.uid, collectionName));
                  batch.set(newDocRef, { ...itemData, uid: user.uid });
              }
            }
          }
          
          const { name, logoUrl } = data.clubInfo;
          const clubInfoRef = doc(db, "users", user.uid, "clubInfo", "main");
          batch.set(clubInfoRef, { name, logoUrl });
  
          await batch.commit();
          resolve();
        } catch (e: any) {
          console.error("Restore error:", e);
          reject(e);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  const value = {
    clubInfo,
    loading,
    updateClubInfo,
    restoreData,
  };

  return (
    <ClubContext.Provider value={value}>
      {children}
    </ClubContext.Provider>
  );
}


export const useClubContext = () => {
  const context = useContext(ClubContext);
  if (context === undefined) {
    throw new Error("useClubContext must be used within a ClubProvider");
  }
  return context;
};
