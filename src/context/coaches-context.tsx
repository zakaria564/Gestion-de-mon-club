
"use client";

import React, { createContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Coach } from '@/lib/data';
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { useAuth } from './auth-context';

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
  const { user } = useAuth();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchCoaches = useCallback(async (currentUser) => {
    if (!currentUser) {
        setCoaches([]);
        setLoading(false);
        return;
    }
    setLoading(true);
    try {
      const coachesCollectionRef = collection(db, 'users', currentUser.uid, 'coaches');
      const coachesSnapshot = await getDocs(coachesCollectionRef);
      const coachesList = coachesSnapshot.docs.map(coachFromDoc);
      setCoaches(coachesList);
    } catch (error) {
      console.error("Error fetching coaches: ", error);
      setCoaches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchCoaches(user);
    } else {
      setCoaches([]);
      setLoading(false);
    }
  }, [user, fetchCoaches]);

  const uploadPhoto = async (photo: string, coachId: string): Promise<string> => {
      if (user && photo && photo.startsWith('data:image')) {
          const storageRef = ref(storage, `users/${user.uid}/coaches/${coachId}-${Date.now()}`);
          await uploadString(storageRef, photo, 'data_url');
          return await getDownloadURL(storageRef);
      }
      return photo;
  }

  const addCoach = async (coach: CoachWithoutId) => {
    if (!user) return;
    const coachesCollectionRef = collection(db, 'users', user.uid, 'coaches');

    try {
        const docRef = await addDoc(coachesCollectionRef, { ...coach, photo: '' });

        if (coach.photo) {
            const photoURL = await uploadPhoto(coach.photo, docRef.id);
            await updateDoc(docRef, { photo: photoURL });
        }
        
        await fetchCoaches(user);
    } catch (error) {
      console.error("Error adding coach: ", error);
    }
  };

  const updateCoach = async (updatedCoach: Coach) => {
    if (!user) return;
    const coachesCollectionRef = collection(db, 'users', user.uid, 'coaches');
    
    try {
        const coachRef = doc(coachesCollectionRef, updatedCoach.id);
        let photoURL = updatedCoach.photo;

        const coachToUpdate = coaches.find(c => c.id === updatedCoach.id);

        if (updatedCoach.photo && updatedCoach.photo.startsWith('data:image')) {
             if (coachToUpdate && coachToUpdate.photo && coachToUpdate.photo.includes('firebasestorage')) {
                try {
                    const oldPhotoRef = ref(storage, coachToUpdate.photo);
                    await deleteObject(oldPhotoRef);
                } catch (error: any) {
                    if (error.code !== 'storage/object-not-found') {
                        console.error("Could not delete old photo, continuing update...", error);
                    }
                }
            }
            photoURL = await uploadPhoto(updatedCoach.photo, updatedCoach.id);
        }

        const { id, ...coachData } = updatedCoach;
        await updateDoc(coachRef, { ...coachData, photo: photoURL });
        await fetchCoaches(user);
    } catch (error) {
        console.error("Error updating coach: ", error);
    }
  };

  const deleteCoach = async (coachId: string) => {
     if (!user) return;
     const coachesCollectionRef = collection(db, 'users', user.uid, 'coaches');

     try {
      const coachRef = doc(coachesCollectionRef, coachId);
       const coachToDelete = coaches.find(c => c.id === coachId);
      if (coachToDelete && coachToDelete.photo && coachToDelete.photo.includes('firebasestorage')) {
          try {
            const photoRef = ref(storage, coachToDelete.photo);
            await deleteObject(photoRef)
          } catch(error: any) {
             if (error.code !== 'storage/object-not-found') {
                 console.error("Error deleting photo:", error);
             }
          }
      }
      await deleteDoc(coachRef);
      await fetchCoaches(user);
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
