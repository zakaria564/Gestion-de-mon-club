
"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, writeBatch } from "firebase/firestore";
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

export function PlayersProvider({ children }: { children: ReactNode }) {
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
        const q = query(collectionRef);
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Player));
        setPlayers(data);
    } catch (err) {
        console.error("Error fetching players: ", err);
    } finally {
        setLoading(false);
    }
  }, [getPlayersCollection]);
  
  useEffect(() => {
    if(user) {
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
      const newPlayerData = { ...playerData, uid: user.uid };
      await addDoc(collectionRef, newPlayerData);
      await fetchPlayers();
    } catch (err) {
      console.error("Error adding player: ", err);
    }
  };

  const updatePlayer = async (playerData: Player) => {
    if (!user) return;
    const oldPlayer = players.find(p => p.id === playerData.id);
    if (!oldPlayer) return;

    const oldName = oldPlayer.name;
    const newName = playerData.name;
    const nameHasChanged = oldName !== newName;

    try {
      const batch = writeBatch(db);
      
      // 1. Update the player document itself
      const playerDocRef = doc(db, "users", user.uid, "players", playerData.id);
      const { id, ...dataToUpdate } = playerData;
      batch.update(playerDocRef, dataToUpdate);

      if (nameHasChanged) {
        // 2. Update results (scorers & assists)
        const resultsRef = collection(db, "users", user.uid, "results");
        const resultsSnap = await getDocs(resultsRef);
        resultsSnap.forEach(resultDoc => {
          const result = resultDoc.data();
          let updated = false;

          const newScorers = result.scorers.map((scorer: any) => {
            if (scorer.playerName === oldName) {
              updated = true;
              return { ...scorer, playerName: newName };
            }
            return scorer;
          });

          const newAssists = result.assists.map((assist: any) => {
            if (assist.playerName === oldName) {
              updated = true;
              return { ...assist, playerName: newName };
            }
            return assist;
          });

          if (updated) {
            batch.update(resultDoc.ref, { scorers: newScorers, assists: newAssists });
          }
        });

        // 3. Update player payments
        const paymentsRef = collection(db, "users", user.uid, "playerPayments");
        const paymentsSnap = await getDocs(paymentsRef);
        paymentsSnap.forEach(paymentDoc => {
          if (paymentDoc.data().member === oldName) {
            batch.update(paymentDoc.ref, { member: newName });
          }
        });
      }

      await batch.commit();
      // We will rely on the global fetch in AppLayout to refetch all data,
      // or we can fetch selectively if needed. For simplicity, we'll let the next render handle it.
      await fetchPlayers(); // Explicitly refetch players after update

    } catch (err) {
      console.error("Error updating player and cascading changes: ", err);
    }
  };

  const deletePlayer = async (id: string) => {
    if (!user) return;
    try {
      const playerDoc = doc(db, "users", user.uid, "players", id);
      await deleteDoc(playerDoc);
      await fetchPlayers();
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
