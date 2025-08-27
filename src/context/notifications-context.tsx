
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, deleteDoc, doc, orderBy, query, onSnapshot } from "firebase/firestore";
import { useAuth } from "./auth-context";
import type { Notification } from "@/lib/data";

export type NewNotification = Omit<Notification, 'id' | 'uid' | 'date'>;

interface NotificationsContextType {
  notifications: Notification[];
  loading: boolean;
  addNotification: (notification: NewNotification) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const getNotificationsCollection = useCallback(() => {
    if (!user) return null;
    return collection(db, "users", user.uid, "notifications");
  }, [user]);

  useEffect(() => {
    const collectionRef = getNotificationsCollection();
    if (!collectionRef) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    
    const q = query(collectionRef, orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Notification));
      setNotifications(data);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching notifications: ", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, getNotificationsCollection]);

  const addNotification = async (notificationData: NewNotification) => {
    const collectionRef = getNotificationsCollection();
    if (!collectionRef || !user) return;
    try {
      const newNotificationData = { 
        ...notificationData,
        date: new Date().toISOString(),
        uid: user.uid 
      };
      await addDoc(collectionRef, newNotificationData);
    } catch (err) {
      console.error("Error adding notification: ", err);
    }
  };
  
  const deleteNotification = async (id: string) => {
    if (!user) return;
    try {
      const notificationDoc = doc(db, "users", user.uid, "notifications", id);
      await deleteDoc(notificationDoc);
    } catch (err) {
      console.error("Error deleting notification: ", err);
    }
  };

  return (
    <NotificationsContext.Provider value={{ notifications, loading, addNotification, deleteNotification }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotificationsContext = () => {
    const context = useContext(NotificationsContext);
    if (context === undefined) {
        throw new Error("useNotificationsContext must be used within a NotificationsProvider");
    }
    return context;
};
