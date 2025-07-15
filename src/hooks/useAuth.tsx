
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  user_id: string;
  username: string;
  password: string;
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

const USERS: User[] = [
  {
    user_id: "founder_001",
    username: "founder",
    password: "founder123",
    role: "Founder",
    name: "Founder Name",
    email: "founder@ubiq.com",
    permissions: ["all"]
  },
  {
    user_id: "ceo_001", 
    username: "ceo",
    password: "ceo123",
    role: "CEO",
    name: "CEO Name",
    email: "ceo@ubiq.com",
    permissions: ["all"]
  },
  {
    user_id: "cto_001",
    username: "cto1",
    password: "cto123",
    role: "CTO",
    name: "CTO One",
    email: "cto1@ubiq.com",
    permissions: ["projects", "tasks", "contacts", "reports"]
  },
  {
    user_id: "cto_002",
    username: "cto2", 
    password: "cto123",
    role: "CTO",
    name: "CTO Two",
    email: "cto2@ubiq.com",
    permissions: ["projects", "tasks", "contacts", "reports"]
  },
  {
    user_id: "dev_001",
    username: "dev1",
    password: "dev123",
    role: "Developer",
    name: "Developer One", 
    email: "dev1@ubiq.com",
    permissions: ["tasks", "projects", "contacts"]
  },
  {
    user_id: "dev_002",
    username: "dev2",
    password: "dev123", 
    role: "Developer",
    name: "Developer Two",
    email: "dev2@ubiq.com",
    permissions: ["tasks", "projects", "contacts"]
  }
];

interface AuthContextType {
  user: CurrentUser | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [failedAttempts, setFailedAttempts] = useState<Record<string, number>>({});
  const [lockedAccounts, setLockedAccounts] = useState<Record<string, number>>({});

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // Check if session is still valid (4 hours)
        const loginTime = new Date(userData.loginTime);
        const now = new Date();
        const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 4) {
          setUser(userData);
          // Update last activity
          const updatedUser = { ...userData, lastActivity: now.toISOString() };
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          setUser(updatedUser);
        } else {
          // Session expired
          localStorage.removeItem('currentUser');
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  // Auto-logout after inactivity
  useEffect(() => {
    if (!user) return;

    const checkActivity = () => {
      const lastActivity = user.lastActivity ? new Date(user.lastActivity) : new Date(user.loginTime);
      const now = new Date();
      const hoursDiff = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff >= 4) {
        logout();
      }
    };

    const interval = setInterval(checkActivity, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [user]);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Check if account is locked
    const lockTime = lockedAccounts[username];
    if (lockTime && Date.now() - lockTime < 5 * 60 * 1000) { // 5 minutes
      return { success: false, error: "Account locked. Try again in 5 minutes." };
    }

    const foundUser = USERS.find(u => u.username === username && u.password === password);
    
    if (foundUser) {
      // Reset failed attempts on successful login
      setFailedAttempts(prev => ({ ...prev, [username]: 0 }));
      setLockedAccounts(prev => ({ ...prev, [username]: 0 }));
      
      const currentUser: CurrentUser = {
        user_id: foundUser.user_id,
        username: foundUser.username,
        role: foundUser.role,
        name: foundUser.name,
        email: foundUser.email,
        permissions: foundUser.permissions,
        loginTime: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };
      
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      setUser(currentUser);
      return { success: true };
    } else {
      // Track failed attempts
      const attempts = (failedAttempts[username] || 0) + 1;
      setFailedAttempts(prev => ({ ...prev, [username]: attempts }));
      
      if (attempts >= 5) {
        setLockedAccounts(prev => ({ ...prev, [username]: Date.now() }));
        return { success: false, error: "Account locked due to too many failed attempts. Try again in 5 minutes." };
      }
      
      return { success: false, error: "Invalid username or password" };
    }
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.permissions.includes('all')) return true;
    return user.permissions.includes(permission);
  };

  // Update activity on user interactions
  useEffect(() => {
    if (!user) return;

    const updateActivity = () => {
      const updatedUser = { ...user, lastActivity: new Date().toISOString() };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
    };

    // Update activity on mouse movement, clicks, keyboard events
    document.addEventListener('mousemove', updateActivity);
    document.addEventListener('click', updateActivity);
    document.addEventListener('keypress', updateActivity);

    return () => {
      document.removeEventListener('mousemove', updateActivity);
      document.removeEventListener('click', updateActivity);
      document.removeEventListener('keypress', updateActivity);
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, hasPermission }}>
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
