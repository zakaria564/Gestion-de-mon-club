
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { useAuth } from "./auth-context";
import type { CalendarEvent } from "@/lib/data";

export type NewCalendarEvent = Omit<CalendarEvent, 'id' | 'uid'>;

interface CalendarContextType {
  calendarEvents: CalendarEvent[];
  loading: boolean;
  addEvent: (event: NewCalendarEvent) => Promise<void>;
  updateEvent: (event: CalendarEvent) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  const getCalendarCollection = useCallback(() => {
    if (!user) return null;
    return collection(db, "users", user.uid, "calendarEvents");
  }, [user]);

  useEffect(() => {
    const collectionRef = getCalendarCollection();
    if (!collectionRef) {
      setCalendarEvents([]);
      setLoading(false);
      return;
    }

    const q = query(collectionRef, orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CalendarEvent));
      setCalendarEvents(data);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching calendar events: ", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, getCalendarCollection]);


  const addEvent = async (eventData: NewCalendarEvent) => {
    const collectionRef = getCalendarCollection();
    if (!collectionRef || !user) return;
    try {
      const newEventData = { ...eventData, uid: user.uid };
      await addDoc(collectionRef, newEventData);
    } catch (err) {
      console.error("Error adding event: ", err);
    }
  };

  const updateEvent = async (eventData: CalendarEvent) => {
    if (!user) return;
    try {
      const eventDoc = doc(db, "users", user.uid, "calendarEvents", eventData.id);
      const { id, ...dataToUpdate } = eventData;
      await updateDoc(eventDoc, dataToUpdate);
    } catch (err) {
      console.error("Error updating event: ", err);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!user) return;
    try {
      const eventDoc = doc(db, "users", user.uid, "calendarEvents", id);
      await deleteDoc(eventDoc);
    } catch (err) {
      console.error("Error deleting event: ", err);
    }
  };

  return (
    <CalendarContext.Provider value={{ calendarEvents, loading, addEvent, updateEvent, deleteEvent }}>
      {children}
    </CalendarContext.Provider>
  );
}

export const useCalendarContext = () => {
    const context = useContext(CalendarContext);
    if (context === undefined) {
        throw new Error("useCalendarContext must be used within a CalendarProvider");
    }
    return context;
};
