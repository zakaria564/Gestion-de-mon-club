
"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, writeBatch } from "firebase/firestore";
import { useAuth } from "./auth-context";
import type { Player } from "@/lib/data";

type NewPlayer = Omit<Player, 'id' | 'uid'>;

interface PlayersContextType {
  players: Player[];
  loading: boolean;
  addPlayer: (player: NewPlayer) => Promise<void>;
  updatePlayer: (player: Player) => Promise<void>;
  deletePlayer: (id: string) => Promise<void>;
  getPlayerById: (id: string) => Player | undefined;
  fetchPlayers: () => Promise<void>;
}

const PlayersContext = createContext<PlayersContextType | undefined>(undefined);

export function PlayersProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlayers = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
        const snapshot = await getDocs(collection(db, "users", user.uid, "players"));
        setPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player)));
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [user]);
  
  // Correction automatique pour Salma Chaddani (fusion des doublons)
  const cleanupSalmaPayments = useCallback(async () => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      const paymentsRef = collection(db, "users", user.uid, "playerPayments");
      const q = query(paymentsRef, where("member", "==", "Salam Chaddani"));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        snapshot.forEach(d => batch.update(d.ref, { member: "Salma Chaddani" }));
        await batch.commit();
        window.location.reload();
      }
    } catch (e) { console.error(e); }
  }, [user]);

  useEffect(() => {
    if(user) { fetchPlayers(); cleanupSalmaPayments(); }
    else { setPlayers([]); setLoading(false); }
  }, [user, fetchPlayers, cleanupSalmaPayments]);

  const addPlayer = async (data: NewPlayer) => {
    if (!user) return;
    await addDoc(collection(db, "users", user.uid, "players"), { ...data, uid: user.uid });
    await fetchPlayers();
  };

  const updatePlayer = async (data: Player) => {
    if (!user) return;
    const old = players.find(p => p.id === data.id);
    if (!old) return;

    try {
      const batch = writeBatch(db);
      const playerRef = doc(db, "users", user.uid, "players", data.id);
      const { id, ...toUpdate } = data;
      batch.update(playerRef, toUpdate);

      if (old.name !== data.name) {
        // Mise à jour des résultats (buteurs/passeurs)
        const resSnap = await getDocs(collection(db, "users", user.uid, "results"));
        resSnap.forEach(d => {
          const r = d.data();
          let upd = false;
          const newS = (r.scorers || []).map((s: any) => { if(s.playerName === old.name) { upd = true; return {...s, playerName: data.name}; } return s; });
          const newA = (r.assists || []).map((a: any) => { if(a.playerName === old.name) { upd = true; return {...a, playerName: data.name}; } return a; });
          if (upd) batch.update(d.ref, { scorers: newS, assists: newA });
        });
        
        // Mise à jour des paiements
        const paySnap = await getDocs(query(collection(db, "users", user.uid, "playerPayments"), where("member", "==", old.name)));
        paySnap.forEach(d => batch.update(d.ref, { member: data.name }));
      }

      await batch.commit();
      if (old.name !== data.name) window.location.reload();
      else await fetchPlayers();
    } catch (err) { console.error(err); }
  };

  const deletePlayer = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "players", id));
    await fetchPlayers();
  };

  return (
    <PlayersContext.Provider value={{ players, loading, addPlayer, updatePlayer, deletePlayer, getPlayerById: (id) => players.find(p => p.id === id), fetchPlayers }}>
      {children}
    </PlayersContext.Provider>
  );
}

export const usePlayersContext = () => {
    const context = useContext(PlayersContext);
    if (!context) throw new Error("usePlayersContext must be used within PlayersProvider");
    return context;
};
