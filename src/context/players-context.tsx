"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "./auth-context";
import type { Player } from "@/lib/data";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

type NewPlayer = Omit<Player, 'id' | 'uid' | 'professionalId'>;

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
  const { user, profile } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlayers = useCallback(async () => {
    const clubId = profile?.role === 'admin' ? user?.uid : profile?.clubId;
    
    if (!clubId) {
      setPlayers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const collectionRef = collection(db, "users", clubId, "players");
    
    let q = query(collectionRef);
    if (profile?.role === 'parent') {
      q = query(collectionRef, where("parentId", "==", user?.uid));
    }
    
    getDocs(q)
      .then((snapshot) => {
        setPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player)));
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: collectionRef.path,
          operation: 'list',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setLoading(false));
  }, [user, profile]);
  
  useEffect(() => {
    if(user && profile) { fetchPlayers(); }
    else if (!user) { setPlayers([]); setLoading(false); }
  }, [user, profile, fetchPlayers]);

  const addPlayer = async (data: NewPlayer) => {
    if (!user) return;
    const clubId = profile?.role === 'admin' ? user.uid : profile?.clubId;
    if (!clubId) return;

    // --- Génération de l'ID Professionnel "Maestro Pro" ---
    const currentYearSuffix = new Date().getFullYear().toString().slice(-2);
    const category = data.category;
    const prefix = "MAE"; // Préfixe Maestro
    
    // On compte le nombre de joueurs dans cette catégorie pour générer le numéro séquentiel
    const playersInCat = players.filter(p => p.category === category).length;
    const sequence = (playersInCat + 1).toString().padStart(3, '0');
    
    const professionalId = `${prefix}-${currentYearSuffix}-${category}-${sequence}`;

    const collectionRef = collection(db, "users", clubId, "players");
    const newDocData = { ...data, professionalId, uid: clubId };
    
    addDoc(collectionRef, newDocData)
      .then(() => fetchPlayers())
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: collectionRef.path,
          operation: 'create',
          requestResourceData: newDocData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const updatePlayer = async (data: Player) => {
    if (!user) return;
    const clubId = profile?.role === 'admin' ? user.uid : profile?.clubId;
    if (!clubId) return;

    const playerRef = doc(db, "users", clubId, "players", data.id);
    const { id, ...toUpdate } = data;

    updateDoc(playerRef, toUpdate)
      .then(() => fetchPlayers())
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: playerRef.path,
          operation: 'update',
          requestResourceData: toUpdate,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const deletePlayer = async (id: string) => {
    if (!user) return;
    const clubId = profile?.role === 'admin' ? user.uid : profile?.clubId;
    if (!clubId) return;

    const playerRef = doc(db, "users", clubId, "players", id);
    
    deleteDoc(playerRef)
      .then(() => fetchPlayers())
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: playerRef.path,
          operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
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
