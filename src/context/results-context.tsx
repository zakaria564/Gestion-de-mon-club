
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { useAuth } from "./auth-context";

export interface Result {
  id: string;
  uid: string;
  opponent: string;
  date: string;
  score: string;
  scorers: string | string[];
  notes?: string;
}

export type NewResult = Omit<Result, 'id' | 'uid'>;

interface ResultsContextType {
  results: Result[];
  loading: boolean;
  addResult: (result: NewResult) => Promise<void>;
  updateResult: (result: Omit<Result, 'uid'>) => Promise<void>;
  deleteResult: (id: string) => Promise<void>;
}

const ResultsContext = createContext<ResultsContextType | undefined>(undefined);

export function ResultsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  const getResultsCollection = useCallback(() => {
    if (!user) return null;
    return collection(db, "users", user.uid, "results");
  }, [user]);

  const fetchResults = useCallback(async () => {
    const collectionRef = getResultsCollection();
    if (!collectionRef) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const snapshot = await getDocs(collectionRef);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Result)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setResults(data);
    } catch (err) {
      console.error("Error fetching results: ", err);
    } finally {
      setLoading(false);
    }
  }, [getResultsCollection]);

  useEffect(() => {
    if (user) {
      fetchResults();
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [user, fetchResults]);

  const processScorers = (scorers: string | string[]): string[] => {
    if (Array.isArray(scorers)) return scorers;
    return scorers.split(',').map(s => s.trim()).filter(s => s.length > 0);
  };

  const addResult = async (resultData: NewResult) => {
    const collectionRef = getResultsCollection();
    if (!collectionRef || !user) return;
    try {
      const newResultData = { 
          ...resultData, 
          uid: user.uid,
          scorers: processScorers(resultData.scorers),
        };
      await addDoc(collectionRef, newResultData);
      fetchResults();
    } catch (err) {
      console.error("Error adding result: ", err);
    }
  };

  const updateResult = async (resultData: Omit<Result, 'uid'>) => {
    if (!user) return;
    try {
      const resultDoc = doc(db, "users", user.uid, "results", resultData.id);
      const { id, ...dataToUpdate } = resultData;
      await updateDoc(resultDoc, {
          ...dataToUpdate,
          scorers: processScorers(dataToUpdate.scorers),
      });
      fetchResults();
    } catch (err) {
      console.error("Error updating result: ", err);
    }
  };

  const deleteResult = async (id: string) => {
    if (!user) return;
    try {
      const resultDoc = doc(db, "users", user.uid, "results", id);
      await deleteDoc(resultDoc);
      fetchResults();
    } catch (err) {
      console.error("Error deleting result: ", err);
    }
  };

  return (
    <ResultsContext.Provider value={{ results, loading, addResult, updateResult, deleteResult }}>
      {children}
    </ResultsContext.Provider>
  );
}

export const useResultsContext = () => {
    const context = useContext(ResultsContext);
    if (context === undefined) {
        throw new Error("useResultsContext must be used within a ResultsProvider");
    }
    return context;
};

    