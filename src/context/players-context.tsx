
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query } from "firebase/firestore";
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
}

const PlayersContext = createContext<PlayersContextType | undefined>(undefined);

export function PlayersProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const getPlayersCollection = useCallback(() => {
    if (!user) return null;
    return collection(db, "users", user.uid, "players");
  }, [user]);

  useEffect(() => {
    const collectionRef = getPlayersCollection();
    if (!collectionRef) {
      setPlayers([]);
      setLoading(false);
      return;
    }

    const q = query(collectionRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Player));
        setPlayers(data);
        setLoading(false);
    }, (err) => {
        console.error("Error fetching players: ", err);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, getPlayersCollection]);

  const addPlayer = async (playerData: NewPlayer) => {
    const collectionRef = getPlayersCollection();
    if (!collectionRef || !user) return;
    try {
      const newPlayerData = { ...playerData, uid: user.uid };
      await addDoc(collectionRef, newPlayerData);
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
    } catch (err) {
      console.error("Error updating player: ", err);
    }
  };

  const deletePlayer = async (id: string) => {
    if (!user) return;
    try {
      const playerDoc = doc(db, "users", user.uid, "players", id);
      await deleteDoc(playerDoc);
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
