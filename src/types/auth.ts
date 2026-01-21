export type UserRole = 'admin' | 'agent' | 'manager';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  photoURL?: string | null;
}

export interface AuthUser {
  user: UserProfile | null;
  loading: boolean;
}
