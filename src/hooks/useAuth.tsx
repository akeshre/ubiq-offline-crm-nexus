
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
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
}

export interface CurrentUser {
  user_id: string;
  username: string;
  role: string;
  name: string;
  email: string;
  permissions: string[];
  loginTime: string;
  lastActivity?: string;
}

interface AuthContextType {
  user: CurrentUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
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
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('👤 User data fetched from Firestore:', userData);
            
            const currentUser: CurrentUser = {
              user_id: firebaseUser.uid,
              username: userData.username || firebaseUser.email?.split('@')[0] || '',
              role: userData.role || 'Developer',
              name: userData.name,
              email: firebaseUser.email || '',
              permissions: userData.permissions || ['contacts', 'deals', 'projects', 'tasks'],
              loginTime: new Date().toISOString(),
              lastActivity: new Date().toISOString()
            };
            
            setUser(currentUser);
          } else {
            console.error('❌ User document not found in Firestore');
            await signOut(auth);
          }
        } catch (error) {
          console.error('❌ Error fetching user data:', error);
          await signOut(auth);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    console.log('🔐 Attempting login for:', email);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login successful for:', userCredential.user.email);
      return { success: true };
    } catch (error: any) {
      console.error('❌ Login error:', error.message);
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
        name,
        email,
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
    <AuthContext.Provider value={{ user, login, signup, logout, loading, hasPermission }}>
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
