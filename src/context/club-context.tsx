
"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, getDocs, writeBatch } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "./auth-context";
import { usePlayersContext } from "./players-context";
import { useCoachesContext } from "./coaches-context";
import { useCalendarContext } from "./calendar-context";
import { useFinancialContext } from "./financial-context";
import { useResultsContext } from "./results-context";

interface ClubInfo {
  name: string;
  logoUrl: string | null;
}

interface ClubContextType {
  clubInfo: ClubInfo;
  loading: boolean;
  updateClubInfo: (name: string, logoFile?: File) => Promise<void>;
  backupData: () => Promise<void>;
  restoreData: (file: File) => Promise<void>;
}

const ClubContext = createContext<ClubContextType | undefined>(undefined);

function ClubBusinessLogic({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [clubInfo, setClubInfo] = useState<ClubInfo>({ name: "Gestion Club", logoUrl: null });
  const [loading, setLoading] = useState(true);

  // References to other contexts to get data for backup/restore
  const playersCtx = usePlayersContext();
  const coachesCtx = useCoachesContext();
  const calendarCtx = useCalendarContext();
  const financialCtx = useFinancialContext();
  const resultsCtx = useResultsContext();

  const getClubInfoDocRef = useCallback(() => {
    if (!user) return null;
    return doc(db, "users", user.uid, "clubInfo", "main");
  }, [user]);

  const fetchClubInfo = useCallback(async () => {
    const docRef = getClubInfoDocRef();
    if (!docRef) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setClubInfo(docSnap.data() as ClubInfo);
      } else {
        await setDoc(docRef, clubInfo);
      }
    } catch (err) {
      console.error("Error fetching club info: ", err);
    } finally {
      setLoading(false);
    }
  }, [getClubInfoDocRef, clubInfo]);

  useEffect(() => {
    if (user) {
      fetchClubInfo();
    } else {
      setClubInfo({ name: "Gestion Club", logoUrl: null });
      setLoading(false);
    }
  }, [user, fetchClubInfo]);

  const updateClubInfo = async (name: string, logoFile?: File) => {
    const docRef = getClubInfoDocRef();
    if (!docRef || !user) return;
    setLoading(true);
    try {
      let logoUrl = clubInfo.logoUrl;
      if (logoFile) {
        const storageRef = ref(storage, `users/${user.uid}/logos/${logoFile.name}`);
        await uploadBytes(storageRef, logoFile);
        logoUrl = await getDownloadURL(storageRef);
      }
      const newInfo = { name, logoUrl };
      await setDoc(docRef, newInfo);
      setClubInfo(newInfo);
    } catch (err) {
      console.error("Error updating club info: ", err);
    } finally {
      setLoading(false);
    }
  };

  const backupData = async () => {
    const dataToBackup = {
      clubInfo: clubInfo,
      players: playersCtx.players,
      coaches: coachesCtx.coaches,
      calendarEvents: calendarCtx.calendarEvents,
      playerPayments: financialCtx.playerPayments,
      coachSalaries: financialCtx.coachSalaries,
      results: resultsCtx.results,
    };

    const jsonString = JSON.stringify(dataToBackup, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const date = new Date().toISOString().slice(0, 10);
    a.download = `backup-gestion-club-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const restoreData = async (file: File) => {
    if (!user) throw new Error("Utilisateur non authentifié.");
  
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
  
          // Basic validation
          const requiredKeys = ['players', 'coaches', 'calendarEvents', 'playerPayments', 'coachSalaries', 'results', 'clubInfo'];
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
          };
  
          const batch = writeBatch(db);
  
          // Delete old data
          for (const collectionName in collections) {
            const collectionRef = collection(db, "users", user.uid, collectionName);
            const snapshot = await getDocs(collectionRef);
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
          }
          
          // Add new data
          for (const collectionName in collections) {
            const items = collections[collectionName];
            for (const item of items) {
                const { id, ...itemData } = item;
                const newDocRef = doc(collection(db, "users", user.uid, collectionName));
                batch.set(newDocRef, { ...itemData, uid: user.uid });
            }
          }
          
          // Restore Club Info
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
    backupData,
    restoreData,
  };

  return (
    <ClubContext.Provider value={value}>
      {children}
    </ClubContext.Provider>
  );
}

export function ClubProvider({ children }: { children: React.ReactNode }) {
  return <ClubBusinessLogic>{children}</ClubBusinessLogic>
}

export const useClubContext = () => {
  const context = useContext(ClubContext);
  if (context === undefined) {
    throw new Error("useClubContext must be used within a ClubProvider");
  }
  return context;
};
