
"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { useAuth } from "./auth-context";
import type { CalendarEvent } from "@/lib/data";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

export type NewCalendarEvent = Omit<CalendarEvent, 'id' | 'uid'>;

interface CalendarContextType {
  calendarEvents: CalendarEvent[];
  loading: boolean;
  addEvent: (event: NewCalendarEvent) => Promise<void>;
  updateEvent: (event: CalendarEvent) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  fetchCalendarEvents: () => Promise<void>;
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
    getDocs(query(collectionRef, orderBy("date", "desc")))
      .then((snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CalendarEvent));
        data.sort((a, b) => {
          if (a.date > b.date) return -1;
          if (a.date < b.date) return 1;
          if (a.time && b.time) return a.time.localeCompare(b.time);
          return 0;
        });
        setCalendarEvents(data);
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: collectionRef.path,
          operation: 'list',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setLoading(false));
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
    const newDocData = { ...eventData, uid: user.uid };
    addDoc(collectionRef, newDocData)
      .then(() => fetchCalendarEvents())
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: collectionRef.path,
          operation: 'create',
          requestResourceData: newDocData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const updateEvent = async (eventData: CalendarEvent) => {
    if (!user) return;
    const eventDoc = doc(db, "users", user.uid, "calendarEvents", eventData.id);
    const { id, ...dataToUpdate } = eventData;
    updateDoc(eventDoc, dataToUpdate)
      .then(() => fetchCalendarEvents())
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: eventDoc.path,
          operation: 'update',
          requestResourceData: dataToUpdate,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const deleteEvent = async (id: string) => {
    if (!user) return;
    const eventDoc = doc(db, "users", user.uid, "calendarEvents", id);
    deleteDoc(eventDoc)
      .then(() => fetchCalendarEvents())
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: eventDoc.path,
          operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  return (
    <CalendarContext.Provider value={{ calendarEvents, loading, addEvent, updateEvent, deleteEvent, fetchCalendarEvents }}>
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
