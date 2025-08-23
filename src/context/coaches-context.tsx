
"use client";

import React, { createContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Coach } from '@/lib/data';
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';

type CoachWithoutId = Omit<Coach, 'id'>;

interface CoachesContextType {
  coaches: Coach[];
  loading: boolean;
  addCoach: (coach: CoachWithoutId) => Promise<void>;
  updateCoach: (coach: Coach) => Promise<void>;
  deleteCoach: (coachId: string) => Promise<void>;
}

export const CoachesContext = createContext<CoachesContextType | undefined>(undefined);

const coachFromDoc = (doc: QueryDocumentSnapshot<DocumentData>): Coach => {
    const data = doc.data();
    return {
        id: doc.id,
        name: data.name,
        specialization: data.specialization,
        status: data.status,
        contact: data.contact,
        category: data.category,
        phone: data.phone,
        photo: data.photo
    };
};


export const CoachesProvider = ({ children }: { children: ReactNode }) => {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCoaches = useCallback(async () => {
    try {
      setLoading(true);
      const coachesCollection = collection(db, 'coaches');
      const coachesSnapshot = await getDocs(coachesCollection);
      const coachesList = coachesSnapshot.docs.map(coachFromDoc);
      setCoaches(coachesList);
    } catch (error) {
      console.error("Error fetching coaches: ", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoaches();
  }, [fetchCoaches]);

  const uploadPhoto = async (photo: string, coachId: string): Promise<string> => {
      if (photo.startsWith('data:image')) {
          const storageRef = ref(storage, `coaches/${coachId}.jpg`);
          await uploadString(storageRef, photo, 'data_url');
          return await getDownloadURL(storageRef);
      }
      return photo;
  }

  const addCoach = async (coach: CoachWithoutId) => {
    try {
        const docRef = await addDoc(collection(db, 'coaches'), { ...coach, photo: '' });
        let photoURL = coach.photo;
        if (coach.photo) {
            photoURL = await uploadPhoto(coach.photo, docRef.id);
        }
        await updateDoc(docRef, { photo: photoURL });
        await fetchCoaches();
    } catch (error) {
      console.error("Error adding coach: ", error);
    }
  };

  const updateCoach = async (updatedCoach: Coach) => {
    try {
        const coachRef = doc(db, 'coaches', updatedCoach.id);
        let photoURL = updatedCoach.photo;
        if (updatedCoach.photo) {
            photoURL = await uploadPhoto(updatedCoach.photo, updatedCoach.id);
        }
        await updateDoc(coachRef, { ...updatedCoach, photo: photoURL, id: undefined });
        await fetchCoaches();
    } catch (error) {
        console.error("Error updating coach: ", error);
    }
  };

  const deleteCoach = async (coachId: string) => {
     try {
      const coachRef = doc(db, 'coaches', coachId);
       const coachToDelete = coaches.find(c => c.id === coachId);
      if (coachToDelete && coachToDelete.photo) {
          const photoRef = ref(storage, coachToDelete.photo);
          await deleteObject(photoRef).catch(error => {
             if (error.code !== 'storage/object-not-found') {
                 console.error("Error deleting photo:", error);
             }
          });
      }
      await deleteDoc(coachRef);
      await fetchCoaches();
    } catch (error) {
      console.error("Error deleting coach: ", error);
    }
  };

  return (
    <CoachesContext.Provider value={{ coaches, loading, addCoach, updateCoach, deleteCoach }}>
      {children}
    </CoachesContext.Provider>
  );
};
