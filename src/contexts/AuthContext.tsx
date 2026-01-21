'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  UserCredential,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { getUserProfile, createUserProfile } from '@/lib/firebase/firestore';
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authResolve, setAuthResolve] = useState<((profile: UserProfile | null) => void) | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        // User is signed in, fetch their profile
        const profile = await getUserProfile(firebaseUser.uid);
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

    // Wait for the auth state to update and profile to be loaded
    await authPromise;

    return credential;
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ): Promise<UserCredential> => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);

    // Create user profile in Firestore
    await createUserProfile(credential.user.uid, email, displayName);

    return credential;
  };

  const signOut = async (): Promise<void> => {
    // Clear user state before signing out to prevent race conditions
    setUser(null);
    setLoading(true);

    try {
      await firebaseSignOut(auth);

      // Force a page reload after sign-out to clean up any lingering connections
      // This prevents CORS errors from stale Firestore listeners
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during sign out:', error);
      setLoading(false);
      throw error;
    }
  };

  const refreshUser = async (): Promise<void> => {
    if (auth.currentUser) {
      const profile = await getUserProfile(auth.currentUser.uid);
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
