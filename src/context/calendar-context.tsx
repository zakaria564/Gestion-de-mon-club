
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
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

  const getEventsCollectionRef = useCallback(() => {
    if (!user) return null;
    return collection(db, "users", user.uid, "calendarEvents");
  }, [user]);

  const fetchEvents = useCallback(async () => {
    const collectionRef = getEventsCollectionRef();
    if (!collectionRef) {
      setCalendarEvents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const snapshot = await getDocs(collectionRef);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CalendarEvent));
      setCalendarEvents(data);
    } catch (err) {
      console.error("Error fetching calendar events: ", err);
    } finally {
      setLoading(false);
    }
  }, [getEventsCollectionRef]);

  useEffect(() => {
    if (user) {
      fetchEvents();
    } else {
      setCalendarEvents([]);
      setLoading(false);
    }
  }, [user, fetchEvents]);

  const addEvent = async (eventData: NewCalendarEvent) => {
    const collectionRef = getEventsCollectionRef();
    if (!collectionRef || !user) return;
    try {
      const newEventData = { ...eventData, uid: user.uid };
      await addDoc(collectionRef, newEventData);
      fetchEvents();
    } catch (err) {
      console.error("Error adding event: ", err);
    }
  };

  const updateEvent = async (eventData: CalendarEvent) => {
    const collectionRef = getEventsCollectionRef();
    if (!collectionRef) return;
    try {
      const eventDoc = doc(collectionRef, eventData.id);
      const { id, ...dataToUpdate } = eventData;
      await updateDoc(eventDoc, dataToUpdate);
      fetchEvents();
    } catch (err) {
      console.error("Error updating event: ", err);
    }
  };

  const deleteEvent = async (id: string) => {
    const collectionRef = getEventsCollectionRef();
    if (!collectionRef) return;
    try {
      const eventDoc = doc(collectionRef, id);
      await deleteDoc(eventDoc);
      fetchEvents();
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
