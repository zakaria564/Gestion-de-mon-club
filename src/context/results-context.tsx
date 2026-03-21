
"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { useAuth } from "./auth-context";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

export interface PerformanceDetail {
  playerName: string;
  count: number;
}

export interface Result {
  id: string;
  uid: string;
  opponent: string;
  homeTeam?: string;
  awayTeam?: string;
  date: string;
  time: string;
  location: string;
  score: string;
  scorers: PerformanceDetail[];
  assists: PerformanceDetail[];
  category: string;
  teamCategory: string;
  gender: 'Masculin' | 'Féminin';
  homeOrAway: 'home' | 'away';
  matchType: 'club-match' | 'opponent-vs-opponent';
}

export type NewResult = Omit<Result, 'id' | 'uid'>;

interface ResultsContextType {
  results: Result[];
  loading: boolean;
  addResult: (result: NewResult) => Promise<void>;
  updateResult: (result: Omit<Result, 'uid'>) => Promise<void>;
  deleteResult: (id: string) => Promise<void>;
  fetchResults: () => Promise<void>;
}

const ResultsContext = createContext<ResultsContextType | undefined>(undefined);

export function ResultsProvider({ children }: { children: ReactNode }) {
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
    getDocs(query(collectionRef, orderBy("date", "desc")))
      .then((snapshot) => {
        setResults(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Result)));
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: collectionRef.path,
          operation: 'list',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setLoading(false));
  }, [getResultsCollection]);
  
  useEffect(() => {
    if(user) {
      fetchResults();
    } else {
        setResults([]);
        setLoading(false);
    }
  }, [user, fetchResults]);

  const addResult = async (resultData: NewResult) => {
    const collectionRef = getResultsCollection();
    if (!collectionRef || !user) return;
    const newDocData = { ...resultData, uid: user.uid };
    addDoc(collectionRef, newDocData)
      .then(() => fetchResults())
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: collectionRef.path,
          operation: 'create',
          requestResourceData: newDocData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const updateResult = async (resultData: Omit<Result, 'uid'>) => {
    if (!user) return;
    const resultDoc = doc(db, "users", user.uid, "results", resultData.id);
    const { id, ...dataToUpdate } = resultData;
    updateDoc(resultDoc, dataToUpdate)
      .then(() => fetchResults())
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: resultDoc.path,
          operation: 'update',
          requestResourceData: dataToUpdate,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const deleteResult = async (id: string) => {
    if (!user) return;
    const resultDoc = doc(db, "users", user.uid, "results", id);
    deleteDoc(resultDoc)
      .then(() => fetchResults())
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: resultDoc.path,
          operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  return (
    <ResultsContext.Provider value={{ results, loading, addResult, updateResult, deleteResult, fetchResults }}>
      {children}
    </ResultsContext.Provider>
  );
}

export const useResultsContext = () => {
    const context = useContext(ResultsContext);
    if (context === undefined) throw new Error("useResultsContext must be used within a ResultsProvider");
    return context;
};
