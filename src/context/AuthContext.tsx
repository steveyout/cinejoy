import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut as fbSignOut,
  signInAnonymously
} from 'firebase/auth';
import { auth, googleProvider, testFirestoreConnection } from '../services/firebase';
import { syncUserProfile, UserProfileData } from '../services/firestoreSync';
import { trackEvent } from '../services/analytics';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfileData | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  useEffect(() => {
    // Validate Firestore connection on boot
    testFirestoreConnection();

    // Listen to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);

      if (currentUser) {
        try {
          await syncUserProfile(currentUser);
          setUserProfile({
            userId: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Popcorn Moviegoer',
            photoURL: currentUser.photoURL,
            createdAt: currentUser.metadata.creationTime || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } catch (e) {
          console.warn('Profile sync warning:', e);
        }
      } else {
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        await syncUserProfile(res.user);
        trackEvent('login', { method: 'google', userId: res.user.uid });
      }
      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      trackEvent('logout', { userId: user?.uid });
      await fbSignOut(auth);
      setUser(null);
      setUserProfile(null);
      setIsProfileModalOpen(false);
    } catch (err) {
      console.error('Sign Out Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isLoading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
