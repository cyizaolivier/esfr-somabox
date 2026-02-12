import React, { createContext, useContext, useState } from 'react'

export type UserRole = 'Student' | 'Facilitator' | 'Admin'

type User = { email: string; role: UserRole } | null

type AuthContext = {
  user: User
  signIn: (email: string, password: string, role: UserRole) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => void
  updateUser: (email: string) => void
  deleteAccount: () => void
}

const AuthContext = createContext<AuthContext | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('soma_auth');
    return saved ? JSON.parse(saved) : null;
  })

  const signIn = async (email: string, _password: string, role: UserRole) => {
    // mock delay
    await new Promise((r) => setTimeout(r, 400))
    const userData = { email, role };
    setUser(userData)
    localStorage.setItem('soma_auth', JSON.stringify(userData));
  }

  const signUp = async (email: string) => {
    await new Promise((r) => setTimeout(r, 400))
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
