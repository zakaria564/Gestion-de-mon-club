"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, writeBatch } from "firebase/firestore";
import { useAuth } from "./auth-context";
import type { Player } from "@/lib/data";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

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
    const collectionRef = collection(db, "users", user.uid, "players");
    
    getDocs(collectionRef)
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
  }, [user]);
  
  const cleanupSalmaPayments = useCallback(async () => {
    if (!user) return;
    const paymentsRef = collection(db, "users", user.uid, "playerPayments");
    const q = query(paymentsRef, where("member", "==", "Salam Chaddani"));
    
    getDocs(q)
      .then(async (snapshot) => {
        if (!snapshot.empty) {
          const batch = writeBatch(db);
          snapshot.forEach(d => batch.update(d.ref, { member: "Salma Chaddani" }));
          await batch.commit();
          window.location.reload();
        }
      })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: paymentsRef.path,
          operation: 'list',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  }, [user]);

  useEffect(() => {
    if(user) { fetchPlayers(); cleanupSalmaPayments(); }
    else { setPlayers([]); setLoading(false); }
  }, [user, fetchPlayers, cleanupSalmaPayments]);

  const addPlayer = async (data: NewPlayer) => {
    if (!user) return;
    const collectionRef = collection(db, "users", user.uid, "players");
    const newDocData = { ...data, uid: user.uid };
    
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
    const old = players.find(p => p.id === data.id);
    if (!old) return;

    const playerRef = doc(db, "users", user.uid, "players", data.id);
    const { id, ...toUpdate } = data;

    updateDoc(playerRef, toUpdate)
      .then(async () => {
        if (old.name !== data.name) {
          const batch = writeBatch(db);
          // Mise à jour des résultats et paiements en cascade...
          // On pourrait aussi ajouter des .catch ici si nécessaire
          window.location.reload();
        } else {
          await fetchPlayers();
        }
      })
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
    const playerRef = doc(db, "users", user.uid, "players", id);
    
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
