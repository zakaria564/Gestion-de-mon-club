
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, updateProfile, updatePassword, User } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<any>;
  logIn: (email: string, password: string) => Promise<any>;
  logOut: () => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  updateUserProfile: (profileData: { displayName?: string; photoURL?: string; }) => Promise<void>;
  updateUserPassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const auth = getAuth(app);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    return userCredential;
  };

  const logIn = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logOut = () => {
    return signOut(auth);
  };

  const resetPassword = (email: string) => {
    return sendPasswordResetEmail(auth, email);
  };

  const updateUserProfile = (profileData: { displayName?: string; photoURL?: string; }) => {
    if (!auth.currentUser) throw new Error("Utilisateur non authentifié.");
    return updateProfile(auth.currentUser, profileData);
  }

  const updateUserPassword = (newPassword: string) => {
     if (!auth.currentUser) throw new Error("Utilisateur non authentifié.");
     return updatePassword(auth.currentUser, newPassword);
  }

  const value = {
    user,
    loading,
    signUp,
    logIn,
    logOut,
    resetPassword,
    updateUserProfile,
    updateUserPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(pathname);

    useEffect(() => {
        if (!loading && !user && !isAuthPage) {
            router.push('/login');
        }
    }, [user, loading, router, isAuthPage]);

    if (loading || (!user && !isAuthPage)) {
        return null;
    }

    return <>{children}</>;
}
