import React, { createContext, useContext, useState } from 'react'

type User = { email: string } | null

type AuthContext = {
  user: User
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContext | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null)

  const signIn = async (email: string) => {
    // mock delay
    await new Promise((r) => setTimeout(r, 400))
    setUser({ email })
  }

  const signUp = async (email: string) => {
    await new Promise((r) => setTimeout(r, 400))
    setUser({ email })
  }

  const signOut = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
