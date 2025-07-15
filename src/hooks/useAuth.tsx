
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface User {
  user_id: string;
  username: string;
  role: string;
  name: string;
  email: string;
  permissions: string[];
  photoURL?: string;
}

export interface CurrentUser {
  user_id: string;
  username: string;
  role: string;
  name: string;
  email: string;
  permissions: string[];
  photoURL?: string;
  loginTime: string;
  lastActivity?: string;
}

interface AuthContextType {
  user: CurrentUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 Setting up Firebase Auth listener...');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      console.log('🔐 Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
      
      if (firebaseUser) {
        try {
          console.log('👤 Firebase user data:', {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL
          });

          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('👤 User data fetched from Firestore:', userData);
            
            const currentUser: CurrentUser = {
              user_id: firebaseUser.uid,
              username: userData.username || firebaseUser.email?.split('@')[0] || '',
              role: userData.role || 'Developer',
              name: userData.name || firebaseUser.displayName || '',
              email: firebaseUser.email || '',
              photoURL: userData.photoURL || firebaseUser.photoURL || undefined,
              permissions: userData.permissions || ['contacts', 'deals', 'projects', 'tasks'],
              loginTime: new Date().toISOString(),
              lastActivity: new Date().toISOString()
            };
            
            setUser(currentUser);
            console.log('✅ User authenticated successfully:', currentUser.email);
          } else {
            console.log('📝 Creating new user document in Firestore...');
            // Create user document for Google sign-in users
            const userData = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || null,
              username: firebaseUser.email?.split('@')[0] || '',
              role: 'Developer',
              permissions: ['contacts', 'deals', 'projects', 'tasks'],
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            await setDoc(doc(db, 'users', firebaseUser.uid), userData);
            console.log('✅ New user document created:', userData);
            
            const currentUser: CurrentUser = {
              user_id: firebaseUser.uid,
              username: userData.username,
              role: userData.role,
              name: userData.name,
              email: userData.email,
              photoURL: userData.photoURL || undefined,
              permissions: userData.permissions,
              loginTime: new Date().toISOString(),
              lastActivity: new Date().toISOString()
            };
            
            setUser(currentUser);
          }
        } catch (error) {
          console.error('❌ Error handling user authentication:', error);
          await signOut(auth);
        }
      } else {
        setUser(null);
        console.log('👤 User logged out');
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    console.log('🔐 Attempting email/password login for:', email);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Email/password login successful for:', userCredential.user.email);
      return { success: true };
    } catch (error: any) {
      console.error('❌ Email/password login error:', error.message);
      return { success: false, error: error.message };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    console.log('🔐 Attempting Google Sign-In...');
    
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      console.log('✅ Google Sign-In successful for:', result.user.email);
      console.log('📊 Google user info:', {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('❌ Google Sign-In error:', error.message);
      return { success: false, error: error.message };
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    console.log('🔐 Attempting signup for:', email, 'with name:', name);
    
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      console.log('✅ Firebase Auth user created:', firebaseUser.uid);
      
      // Create user document in Firestore
      const userData = {
        uid: firebaseUser.uid,
        name,
        email,
        photoURL: null,
        username: email.split('@')[0],
        role: 'Developer', // Default role
        permissions: ['contacts', 'deals', 'projects', 'tasks'], // Default permissions
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      console.log('✅ User document created in Firestore:', userData);
      
      return { success: true };
    } catch (error: any) {
      console.error('❌ Signup error:', error.message);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    console.log('🔐 Logging out user...');
    try {
      await signOut(auth);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.permissions.includes('all')) return true;
    return user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, signup, logout, loading, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
