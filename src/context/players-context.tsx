
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
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

async function uploadPhoto(uid: string, photoDataUrl: string, playerId: string): Promise<string> {
    if (!photoDataUrl.startsWith('data:image')) {
        // This is not a new photo upload, just an existing URL.
        return photoDataUrl;
    }
    const storageRef = ref(storage, `users/${uid}/player_photos/${playerId}-${Date.now()}`);
    const snapshot = await uploadString(storageRef, photoDataUrl, 'data_url');
    return await getDownloadURL(snapshot.ref);
}

export function PlayersProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const getPlayersCollection = useCallback(() => {
    if (!user) return null;
    return collection(db, "users", user.uid, "players");
  }, [user]);

  const fetchPlayers = useCallback(async () => {
    const collectionRef = getPlayersCollection();
    if (!collectionRef) {
      setPlayers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const snapshot = await getDocs(collectionRef);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Player));
      setPlayers(data);
    } catch (err) {
      console.error("Error fetching players: ", err);
    } finally {
      setLoading(false);
    }
  }, [getPlayersCollection]);

  useEffect(() => {
    if (user) {
      fetchPlayers();
    } else {
      setPlayers([]);
      setLoading(false);
    }
  }, [user, fetchPlayers]);

  const addPlayer = async (playerData: NewPlayer) => {
    const collectionRef = getPlayersCollection();
    if (!collectionRef || !user) return;
    try {
      let photoUrl = playerData.photo || '';
      if (photoUrl) {
          photoUrl = await uploadPhoto(user.uid, photoUrl, `new_player_${Date.now()}`);
      }

      const newPlayerData = { ...playerData, photo: photoUrl, uid: user.uid };
      await addDoc(collectionRef, newPlayerData);
      fetchPlayers();
    } catch (err) {
      console.error("Error adding player: ", err);
    }
  };

  const updatePlayer = async (playerData: Player) => {
    if (!user) return;
    try {
        let photoUrl = playerData.photo || '';
        if (photoUrl && photoUrl.startsWith('data:image')) {
            photoUrl = await uploadPhoto(user.uid, photoUrl, playerData.id);
        }

        const playerDoc = doc(db, "users", user.uid, "players", playerData.id);
        const { id, ...dataToUpdate } = { ...playerData, photo: photoUrl };
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
