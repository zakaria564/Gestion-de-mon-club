
"use client";

import React, { createContext, useState, ReactNode, useCallback, useEffect, useContext } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { useAuth } from './auth-context';
import { format, parse, parseISO } from 'date-fns';

export type CalendarEvent = {
  id: string;
  type: string;
  opponent: string;
  date: string; // Stored as ISO string
  time: string;
  location: string;
};

export type NewCalendarEvent = Omit<CalendarEvent, 'id'>;

interface CalendarContextType {
  calendarEvents: CalendarEvent[];
  loading: boolean;
  addEvent: (event: NewCalendarEvent) => Promise<void>;
  updateEvent: (event: CalendarEvent) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
}

export const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

const eventFromDoc = (doc: QueryDocumentSnapshot<DocumentData>): CalendarEvent => {
    const data = doc.data();
    return {
        id: doc.id,
        type: data.type,
        opponent: data.opponent,
        date: data.date,
        time: data.time,
        location: data.location,
    };
};

export const CalendarProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  const getEventsCollectionRef = useCallback(() => {
    if (!user) return null;
    return collection(db, 'users', user.uid, 'calendarEvents');
  }, [user]);

  const fetchEvents = useCallback(async () => {
    const eventsCollectionRef = getEventsCollectionRef();
    if (!eventsCollectionRef) {
      setCalendarEvents([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const eventsSnapshot = await getDocs(eventsCollectionRef);
      const eventsList = eventsSnapshot.docs
        .map(eventFromDoc)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setCalendarEvents(eventsList);
    } catch (error) {
      console.error("Error fetching calendar events: ", error);
      setCalendarEvents([]);
    } finally {
      setLoading(false);
    }
  }, [getEventsCollectionRef]);

  useEffect(() => {
    if(user) {
      fetchEvents();
    } else {
      setCalendarEvents([]);
      setLoading(false);
    }
  }, [user, fetchEvents]);

  const addEvent = async (event: NewCalendarEvent) => {
    const eventsCollectionRef = getEventsCollectionRef();
    if (!eventsCollectionRef) return;
    try {
      const eventDate = parse(event.date, 'yyyy-MM-dd', new Date());
      const dateToStore = eventDate.toISOString();
      
      await addDoc(eventsCollectionRef, { 
        ...event,
        date: dateToStore
      });
      await fetchEvents();
    } catch (error) {
      console.error("Error adding event: ", error);
    }
  };

  const updateEvent = async (updatedEvent: CalendarEvent) => {
    const eventsCollectionRef = getEventsCollectionRef();
    if (!eventsCollectionRef) return;
    try {
      const eventRef = doc(eventsCollectionRef, updatedEvent.id);
      
      const dateToStore = updatedEvent.date.includes('T') ? updatedEvent.date : parse(updatedEvent.date, 'yyyy-MM-dd', new Date()).toISOString();

      const { id, ...eventData } = updatedEvent;
      await updateDoc(eventRef, {
        ...eventData,
        date: dateToStore,
      });
      await fetchEvents();
    } catch (error) {
      console.error("Error updating event: ", error);
    }
  };

  const deleteEvent = async (eventId: string) => {
     const eventsCollectionRef = getEventsCollectionRef();
     if (!eventsCollectionRef) return;
     try {
      const eventRef = doc(eventsCollectionRef, eventId);
      await deleteDoc(eventRef);
      await fetchEvents();
    } catch (error) {
      console.error("Error deleting event: ", error);
    }
  };

  return (
    <CalendarContext.Provider value={{ calendarEvents, loading, addEvent, updateEvent, deleteEvent }}>
      {children}
    </CalendarContext.Provider>
  );
};
