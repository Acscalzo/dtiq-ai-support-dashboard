import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from './client';
import { UserProfile, UserRole } from '@/types/auth';

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        uid: data.uid,
        email: data.email,
        displayName: data.displayName,
        role: data.role,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        photoURL: data.photoURL || null,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Create user profile in Firestore
 * Assigns "admin" role if this is the first user, otherwise "agent"
 */
export async function createUserProfile(
  uid: string,
  email: string,
  displayName: string | null
): Promise<UserProfile> {
  try {
    // Check if this is the first user
    const settingsDoc = await getDoc(doc(db, 'settings', 'app'));
    const isFirstUser = !settingsDoc.exists() || !settingsDoc.data()?.firstUserCreated;

    const role: UserRole = isFirstUser ? 'admin' : 'agent';
    const now = Timestamp.now();

    const userProfile: UserProfile = {
      uid,
      email,
      displayName: displayName || email.split('@')[0],
      role,
      createdAt: now.toDate().toISOString(),
      updatedAt: now.toDate().toISOString(),
    };

    // Create user document
    await setDoc(doc(db, 'users', uid), {
      ...userProfile,
      createdAt: now,
      updatedAt: now,
    });

    // Mark first user as created
    if (isFirstUser) {
      await setDoc(doc(db, 'settings', 'app'), {
        firstUserCreated: true,
      });
    }

    return userProfile;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid), {
      role,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}
