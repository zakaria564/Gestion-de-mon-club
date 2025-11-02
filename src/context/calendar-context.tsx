

"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
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

export function CalendarProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  const getCalendarCollection = useCallback(() => {
    if (!user) return null;
    return collection(db, "users", user.uid, "calendarEvents");
  }, [user]);

  const fetchCalendarEvents = useCallback(async () => {
    const collectionRef = getCalendarCollection();
    if (!collectionRef) {
      setCalendarEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
        const q = query(collectionRef, orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CalendarEvent));
        
        // Tri côté client par heure car Firestore ne peut pas faire un double tri sans index composite
        data.sort((a, b) => {
          if (a.date > b.date) return -1;
          if (a.date < b.date) return 1;
          if (a.time && b.time) {
            return a.time.localeCompare(b.time);
          }
          return 0;
        });

        setCalendarEvents(data);
    } catch (err) {
        console.error("Error fetching calendar events: ", err);
    } finally {
        setLoading(false);
    }
  }, [getCalendarCollection]);

  useEffect(() => {
    if (user) {
      fetchCalendarEvents();
    } else {
        setCalendarEvents([]);
        setLoading(false);
    }
  }, [user, fetchCalendarEvents]);


  const addEvent = async (eventData: NewCalendarEvent) => {
    const collectionRef = getCalendarCollection();
    if (!collectionRef || !user) return;
    try {
      const newEventData = { ...eventData, uid: user.uid };
      await addDoc(collectionRef, newEventData);
      await fetchCalendarEvents();
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
      await fetchCalendarEvents();
    } catch (err) {
      console.error("Error updating event: ", err);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!user) return;
    try {
      const eventDoc = doc(db, "users", user.uid, "calendarEvents", id);
      await deleteDoc(eventDoc);
      await fetchCalendarEvents();
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
    