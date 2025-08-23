
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { useAuth } from "./auth-context";
import type { Player } from "@/lib/data";

interface PlayersContextType {
  players: Player[];
  loading: boolean;
  addPlayer: (player: Omit<Player, 'id' | 'uid'>) => Promise<void>;
  updatePlayer: (player: Player) => Promise<void>;
  deletePlayer: (id: string) => Promise<void>;
  getPlayerById: (id: string) => Player | undefined;
}

const PlayersContext = createContext<PlayersContextType | undefined>(undefined);

export function PlayersProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlayers = useCallback(async () => {
    if (!user) {
      setPlayers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const collectionRef = collection(db, "users", user.uid, "players");
      const snapshot = await getDocs(collectionRef);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Player));
      setPlayers(data);
    } catch (err) {
      console.error("Error fetching players: ", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchPlayers();
    } else {
      setPlayers([]);
      setLoading(false);
    }
  }, [user, fetchPlayers]);

  const addPlayer = async (playerData: Omit<Player, 'id' | 'uid'>) => {
    if (!user) return;
    try {
      const collectionRef = collection(db, "users", user.uid, "players");
      const newPlayerData = { ...playerData, uid: user.uid };
      await addDoc(collectionRef, newPlayerData);
      fetchPlayers();
    } catch (err) {
      console.error("Error adding player: ", err);
    }
  };

  const updatePlayer = async (playerData: Player) => {
    if (!user) return;
    try {
      const playerDoc = doc(db, "users", user.uid, "players", playerData.id);
      const { id, ...dataToUpdate } = playerData;
      await updateDoc(playerDoc, dataToUpdate);
      fetchPlayers();
    } catch (err) {
      console.error("Error updating player: ", err);
    }
  };

  const deletePlayer = async (id: string) => {
    if (!user) return;
    try {
      const playerDoc = doc(db, "users", user.uid, "players", id);
      await deleteDoc(playerDoc);
      fetchPlayers();
    } catch (err) {
      console.error("Error deleting player: ", err);
    }
  };

  const getPlayerById = useCallback((id: string) => {
    return players.find((player) => player.id === id);
  }, [players]);

  return (
    <PlayersContext.Provider value={{ players, loading, addPlayer, updatePlayer, deletePlayer, getPlayerById }}>
      {children}
    </PlayersContext.Provider>
  );
}

export const usePlayersContext = () => {
    const context = useContext(PlayersContext);
    if (context === undefined) {
        throw new Error("usePlayersContext must be used within a PlayersProvider");
    }
    return context;
};
