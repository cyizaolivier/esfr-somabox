import React, { createContext, useContext, useState } from 'react'

export type UserRole = 'Student' | 'Facilitator' | 'Admin'

type User = { email: string; role: UserRole } | null

type StoredUser = { email: string; password: string; role: UserRole }

type AuthContext = {
  user: User
  signIn: (email: string, password: string) => Promise<UserRole>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => void
  updateUser: (email: string) => void
  deleteAccount: () => void
}

const AuthContext = createContext<AuthContext | undefined>(undefined)

// Helper to manage persistent user list
const getUsers = (): StoredUser[] => {
  const users = localStorage.getItem('soma_users');
  return users ? JSON.parse(users) : [];
};

const saveUsers = (users: StoredUser[]) => {
  localStorage.setItem('soma_users', JSON.stringify(users));
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('soma_auth');
    return saved ? JSON.parse(saved) : null;
  })

  // Seed default Admin if no users exist
  React.useEffect(() => {
    const currentUsers = getUsers();
    if (currentUsers.length === 0) {
      saveUsers([{
        email: 'admin@somabox.com',
        password: 'admin123',
        role: 'Admin'
      }]);
    }
  }, []);

  const signIn = async (email: string, password: string): Promise<UserRole> => {
    await new Promise((r) => setTimeout(r, 600))
    
    const users = getUsers();
    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (!foundUser) {
      throw new Error('Invalid email or password');
    }

    const userData = { email, role: foundUser.role };
    setUser(userData)
    localStorage.setItem('soma_auth', JSON.stringify(userData));
    return foundUser.role;
  }

  const signUp = async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 600))
    const users = getUsers();
    
    if (users.find(u => u.email === email)) {
      throw new Error('User already exists');
    }

    const newUser: StoredUser = { email, password, role: 'Student' };
    saveUsers([...users, newUser]);

    const userData = { email, role: 'Student' as UserRole };
    setUser(userData)
    localStorage.setItem('soma_auth', JSON.stringify(userData));
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem('soma_auth');
    localStorage.removeItem('soma_profile');
  }

  const updateUser = (email: string) => {
    if (user) {
      const updatedUser = { ...user, email };
      setUser(updatedUser);
      localStorage.setItem('soma_auth', JSON.stringify(updatedUser));
    }
  }

  const deleteAccount = () => {
    setUser(null);
    localStorage.removeItem('soma_auth');
    localStorage.removeItem('soma_profile');
    localStorage.removeItem('soma_notifications');
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, updateUser, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
