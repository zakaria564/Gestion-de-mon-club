
"use client";

import React, { createContext, useState, ReactNode } from 'react';
import { coaches as initialCoaches, type Coach } from '@/lib/data';

type CoachWithoutId = Omit<Coach, 'id'>;

interface CoachesContextType {
  coaches: Coach[];
  addCoach: (coach: CoachWithoutId) => void;
  updateCoach: (coach: Coach) => void;
  deleteCoach: (coachId: number) => void;
}

export const CoachesContext = createContext<CoachesContextType | undefined>(undefined);

export const CoachesProvider = ({ children }: { children: ReactNode }) => {
  const [coaches, setCoaches] = useState<Coach[]>(initialCoaches);

  const addCoach = (coach: CoachWithoutId) => {
    setCoaches(prevCoaches => {
        const newId = prevCoaches.length > 0 ? Math.max(...prevCoaches.map(c => c.id)) + 1 : 1;
        return [...prevCoaches, { id: newId, ...coach }];
    });
  };

  const updateCoach = (updatedCoach: Coach) => {
    setCoaches(prevCoaches => 
        prevCoaches.map(coach => 
            coach.id === updatedCoach.id ? updatedCoach : coach
        )
    );
  };

  const deleteCoach = (coachId: number) => {
    setCoaches(prevCoaches => prevCoaches.filter(coach => coach.id !== coachId));
  };

  return (
    <CoachesContext.Provider value={{ coaches, addCoach, updateCoach, deleteCoach }}>
      {children}
    </CoachesContext.Provider>
  );
};
