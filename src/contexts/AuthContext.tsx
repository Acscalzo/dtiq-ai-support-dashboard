'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  UserCredential,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { UserProfile } from '@/types/auth';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string, displayName: string) => Promise<UserCredential>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Convert Firebase User to UserProfile
 * Uses Firebase Auth data directly - no Firestore dependency
 * TODO: Store role and additional profile data in PostgreSQL
 */
function firebaseUserToProfile(firebaseUser: User): UserProfile {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    role: 'admin', // Default to admin for now - will be stored in PostgreSQL later
    createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    photoURL: firebaseUser.photoURL || undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authResolve, setAuthResolve] = useState<((profile: UserProfile | null) => void) | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        // Convert Firebase user to profile (no Firestore needed)
        const profile = firebaseUserToProfile(firebaseUser);
        setUser(profile);

        // Resolve any pending auth promises
        if (authResolve) {
          authResolve(profile);
          setAuthResolve(null);
        }
      } else {
        // User is signed out
        setUser(null);

        // Resolve any pending auth promises
        if (authResolve) {
          authResolve(null);
          setAuthResolve(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [authResolve]);

  const signIn = async (email: string, password: string): Promise<UserCredential> => {
    // Create a promise that resolves when onAuthStateChanged fires
    const authPromise = new Promise<UserProfile | null>((resolve) => {
      setAuthResolve(() => resolve);
    });

    const credential = await signInWithEmailAndPassword(auth, email, password);

    // Wait for the auth state to update
    await authPromise;

    return credential;
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ): Promise<UserCredential> => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);

    // Update the user's display name in Firebase Auth
    await updateProfile(credential.user, { displayName });

    return credential;
  };

  const signOut = async (): Promise<void> => {
    setUser(null);
    setLoading(true);

    try {
      await firebaseSignOut(auth);
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during sign out:', error);
      setLoading(false);
      throw error;
    }
  };

  const refreshUser = async (): Promise<void> => {
    if (auth.currentUser) {
      const profile = firebaseUserToProfile(auth.currentUser);
      setUser(profile);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
