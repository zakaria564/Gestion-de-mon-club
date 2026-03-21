"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider, User } from 'firebase/auth';
import { app, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

export type UserRole = 'admin' | 'coach' | 'medical' | 'parent';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  clubId?: string; // L'ID de l'admin propriétaire du club
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<any>;
  logIn: (email: string, password: string) => Promise<any>;
  logOut: () => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  updateUserProfile: (profileData: { displayName?: string; photoURL?: string; }) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateUserRole: (uid: string, role: UserRole, clubId?: string) => Promise<void>;
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    const docRef = doc(db, "userProfiles", uid);
    getDoc(docRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          const newProfile: UserProfile = {
            uid,
            email: auth.currentUser?.email || '',
            displayName: auth.currentUser?.displayName || '',
            role: 'admin',
            clubId: uid, // Par défaut, un admin est son propre clubId
          };
          setDoc(docRef, newProfile)
            .then(() => setProfile(newProfile))
            .catch(async (err) => {
              const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'create',
                requestResourceData: newProfile,
              } satisfies SecurityRuleContext);
              errorEmitter.emit('permission-error', permissionError);
            });
        }
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'get',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await fetchProfile(user.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
      const newProfile: UserProfile = {
        uid: userCredential.user.uid,
        email,
        displayName,
        role: 'admin',
        clubId: userCredential.user.uid,
      };
      const profileRef = doc(db, "userProfiles", userCredential.user.uid);
      setDoc(profileRef, newProfile)
        .then(() => setProfile(newProfile))
        .catch(async (err) => {
          const permissionError = new FirestorePermissionError({
            path: profileRef.path,
            operation: 'create',
            requestResourceData: newProfile,
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
        });
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

  const updateUserProfile = async (profileData: { displayName?: string; photoURL?: string; }) => {
    if (!auth.currentUser) throw new Error("Utilisateur non authentifié.");
    await updateProfile(auth.currentUser, profileData);
    if (profileData.displayName) {
      const docRef = doc(db, "userProfiles", auth.currentUser.uid);
      updateDoc(docRef, { displayName: profileData.displayName })
        .then(() => {
          setProfile(prev => prev ? { ...prev, displayName: profileData.displayName! } : null);
        })
        .catch(async (err) => {
          const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: { displayName: profileData.displayName },
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
        });
    }
  };

  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
     if (!auth.currentUser || !auth.currentUser.email) {
        throw new Error("Utilisateur non authentifié ou email non disponible.");
     }
     const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
     await reauthenticateWithCredential(auth.currentUser, credential);
     return updatePassword(auth.currentUser, newPassword);
  };

  const updateUserRole = async (uid: string, role: UserRole, clubId?: string) => {
    const docRef = doc(db, "userProfiles", uid);
    const updateData: any = { role };
    if (clubId) updateData.clubId = clubId;

    updateDoc(docRef, updateData)
      .then(() => {
        if (user?.uid === uid) {
          setProfile(prev => prev ? { ...prev, ...updateData } : null);
        }
      })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: updateData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    logIn,
    logOut,
    resetPassword,
    updateUserProfile,
    updateUserPassword,
    updateUserRole,
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