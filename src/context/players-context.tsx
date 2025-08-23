
"use client";

import React, { createContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Player } from '@/lib/data';
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';

type PlayerWithoutId = Omit<Player, 'id'>;

interface PlayersContextType {
  players: Player[];
  loading: boolean;
  addPlayer: (player: PlayerWithoutId) => Promise<void>;
  updatePlayer: (player: Player) => Promise<void>;
  deletePlayer: (playerId: string) => Promise<void>;
}

export const PlayersContext = createContext<PlayersContextType | undefined>(undefined);

const playerFromDoc = (doc: QueryDocumentSnapshot<DocumentData>): Player => {
    const data = doc.data();
    return {
        id: doc.id,
        name: data.name,
        birthDate: data.birthDate,
        address: data.address,
        poste: data.poste,
        status: data.status,
        phone: data.phone,
        email: data.email,
        tutorName: data.tutorName,
        tutorPhone: data.tutorPhone,
        photo: data.photo,
        jerseyNumber: data.jerseyNumber,
        category: data.category
    };
};

export const PlayersProvider = ({ children }: { children: ReactNode }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const playersCollectionRef = collection(db, 'players');

  const fetchPlayers = useCallback(async () => {
    try {
      setLoading(true);
      const playersSnapshot = await getDocs(playersCollectionRef);
      const playersList = playersSnapshot.docs.map(playerFromDoc);
      setPlayers(playersList);
    } catch (error) {
      console.error("Error fetching players: ", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);
  
  const uploadPhoto = async (photo: string, playerId: string): Promise<string> => {
      if (photo && photo.startsWith('data:image')) {
          const storageRef = ref(storage, `players/${playerId}-${Date.now()}`);
          await uploadString(storageRef, photo, 'data_url');
          return await getDownloadURL(storageRef);
      }
      return photo;
  }

  const addPlayer = async (player: PlayerWithoutId) => {
    try {
      const docRef = await addDoc(playersCollectionRef, { ...player, photo: '' });

      if (player.photo) {
        const photoURL = await uploadPhoto(player.photo, docRef.id);
        await updateDoc(docRef, { photo: photoURL });
      }

      await fetchPlayers();
    } catch (error) {
      console.error("Error adding player: ", error);
    }
  };

  const updatePlayer = async (updatedPlayer: Player) => {
    try {
        const playerRef = doc(db, 'players', updatedPlayer.id);
        let photoURL = updatedPlayer.photo;

        const playerToUpdate = players.find(p => p.id === updatedPlayer.id);

        if (updatedPlayer.photo && updatedPlayer.photo.startsWith('data:image')) {
            if (playerToUpdate && playerToUpdate.photo) {
                try {
                    const oldPhotoRef = ref(storage, playerToUpdate.photo);
                    await deleteObject(oldPhotoRef);
                } catch (error: any) {
                    if (error.code !== 'storage/object-not-found') {
                        console.error("Could not delete old photo, continuing update...", error);
                    }
                }
            }
            photoURL = await uploadPhoto(updatedPlayer.photo, updatedPlayer.id);
        }

        const { id, ...playerData } = updatedPlayer;
        await updateDoc(playerRef, { ...playerData, photo: photoURL });
        await fetchPlayers();
    } catch (error) {
        console.error("Error updating player: ", error);
    }
  };

  const deletePlayer = async (playerId: string) => {
    try {
      const playerRef = doc(db, 'players', playerId);
      const playerToDelete = players.find(p => p.id === playerId);
      if (playerToDelete && playerToDelete.photo) {
          try {
            const photoRef = ref(storage, playerToDelete.photo);
            await deleteObject(photoRef)
          } catch(error: any) {
             if (error.code !== 'storage/object-not-found') {
                 console.error("Error deleting photo:", error);
             }
          }
      }
      await deleteDoc(playerRef);
      await fetchPlayers();
    } catch (error) {
      console.error("Error deleting player: ", error);
    }
  };

  return (
    <PlayersContext.Provider value={{ players, loading, addPlayer, updatePlayer, deletePlayer }}>
      {children}
    </PlayersContext.Provider>
  );
};
