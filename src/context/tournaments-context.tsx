
"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query } from "firebase/firestore";
import { useAuth } from "./auth-context";
import type { Tournament, NewTournament } from "@/lib/data";

interface TournamentsContextType {
  tournaments: Tournament[];
  loading: boolean;
  addTournament: (tournament: NewTournament) => Promise<void>;
  updateTournament: (tournament: Tournament) => Promise<void>;
  deleteTournament: (id: string) => Promise<void>;
}

const TournamentsContext = createContext<TournamentsContextType | undefined>(undefined);

export function TournamentsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  const getTournamentsCollection = useCallback(() => {
    if (!user) return null;
    return collection(db, "users", user.uid, "tournaments");
  }, [user]);

  const fetchTournaments = useCallback(async () => {
    const collectionRef = getTournamentsCollection();
    if (!collectionRef) {
        setTournaments([]);
        setLoading(false);
        return;
    }
    
    setLoading(true);
    try {
        const q = query(collectionRef);
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Tournament));
        setTournaments(data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
        console.error("Error fetching tournaments: ", err);
    } finally {
        setLoading(false);
    }
  }, [getTournamentsCollection]);
  
  useEffect(() => {
    if(user) {
        fetchTournaments();
    } else {
        setTournaments([]);
        setLoading(false);
    }
  }, [user, fetchTournaments]);

  const addTournament = async (tournamentData: NewTournament) => {
    const collectionRef = getTournamentsCollection();
    if (!collectionRef || !user) return;
    try {
      const newTournamentData = { ...tournamentData, uid: user.uid };
      await addDoc(collectionRef, newTournamentData);
      await fetchTournaments();
    } catch (err) {
      console.error("Error adding tournament: ", err);
    }
  };

  const updateTournament = async (tournamentData: Tournament) => {
    if (!user) return;
    try {
      const tournamentDoc = doc(db, "users", user.uid, "tournaments", tournamentData.id);
      const { id, ...dataToUpdate } = tournamentData;
      await updateDoc(tournamentDoc, dataToUpdate);
      await fetchTournaments();
    } catch (err) {
      console.error("Error updating tournament: ", err);
    }
  };

  const deleteTournament = async (id: string) => {
    if (!user) return;
    try {
      const tournamentDoc = doc(db, "users", user.uid, "tournaments", id);
      await deleteDoc(tournamentDoc);
      await fetchTournaments();
    } catch (err) {
      console.error("Error deleting tournament: ", err);
    }
  };

  return (
    <TournamentsContext.Provider value={{ tournaments, loading, addTournament, updateTournament, deleteTournament }}>
      {children}
    </TournamentsContext.Provider>
  );
}

export const useTournamentsContext = () => {
    const context = useContext(TournamentsContext);
    if (context === undefined) {
        throw new Error("useTournamentsContext must be used within a TournamentsProvider");
    }
    return context;
};
