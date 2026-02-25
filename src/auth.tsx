import React, { createContext, useContext, useState } from 'react'
import { signin, signup, registerUser, UserRole } from './api/auth.api'

export type { UserRole }

type User = { id: string; email: string; role: UserRole } | null

type StoredUser = { email: string; password: string; role: UserRole }

type AuthContext = {
  user: User
  signIn: (email: string, password: string) => Promise<UserRole>
  signUp: (name: string, email: string, password: string, role?: UserRole) => Promise<void>
  registerUser: (name: string, email: string, password: string, role: UserRole) => Promise<void>
  signOut: () => void
  updateUser: (email: string) => void
  deleteAccount: () => void
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string; newPassword?: string }>
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
    try {
      const saved = localStorage.getItem('soma_auth');
      return saved ? JSON.parse(saved) : null;
    } catch {
      // If localStorage data is corrupted, clear it and return null
      localStorage.removeItem('soma_auth');
      return null;
    }
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
    try {
      const response = await signin(email, password);

      // Handle different API response structures
      let userData: { email: string; role?: string };
      let accessToken: string;

      // Check if response has nested user object
      if (response.data.user) {
        userData = response.data.user;
        accessToken = response.data.access_token;
      } else {
        // API returns user directly at top level
        userData = response.data;
        accessToken = response.data.access_token || response.data.token || '';
      }

      console.log("Login response user:", userData)

      // Normalize role from API (API returns "STUDENT", "FACILITATOR", "ADMIN" or lowercase)
      const rawRole = userData.role?.toUpperCase() || 'STUDENT';
      const roleMap: Record<string, UserRole> = {
        'STUDENT': 'Student',
        'FACILITATOR': 'Facilitator',
        'ADMIN': 'Admin'
      };
      const userRole = roleMap[rawRole] || 'Student';
      console.log("Mapped role:", userRole)

      const user = {
        id: (userData as any).id || (userData as any).studentId || (userData as any)._id || 'unknown',
        email: userData.email,
        role: userRole
      };

      // Store auth data
      setUser(user);
      localStorage.setItem('soma_auth', JSON.stringify(user));
      localStorage.setItem('soma_token', accessToken);

      return userRole;
    } catch (error) {
      // Fallback: Try localStorage if API fails (for local demo accounts)
      console.log('API failed, checking localStorage...');
      const users = getUsers();
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (foundUser && foundUser.password === password) {
        console.log('Found user in localStorage:', foundUser);
        const userData = {
          id: (foundUser as any).id || (foundUser as any).studentId || 'local_user',
          email: foundUser.email,
          role: foundUser.role
        };
        setUser(userData);
        localStorage.setItem('soma_auth', JSON.stringify(userData));
        localStorage.setItem('soma_token', 'local_token');
        return foundUser.role;
      }

      console.error('Sign in failed:', error);
      throw new Error('Invalid email or password');
    }
  }

  const signUp = async (name: string, email: string, password: string, role?: UserRole) => {
    try {
      const response = await signup({ name, email, password, role });
      // Return success message from API if available
      if (response.data?.message) {
        return response.data.message;
      }
      return 'Registration successful';
    } catch (error: any) {
      console.error('API signup failed:', error);
      // Return API error message if available
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Registration failed. Please try again.');
    }
  }

  // Admin-only: Register a new user with specific role
  const registerUserFn = async (name: string, email: string, password: string, role: UserRole) => {
    try {
      const response = await registerUser({ name, email, password, role });

      // Also save to localStorage for local user management
      const existingUsers = getUsers();
      const newUser = { email, password, role };
      saveUsers([...existingUsers, newUser]);

      // Return success message from API if available
      if (response.data?.message) {
        return response.data.message;
      }
      return `${role} registered successfully`;
    } catch (error: any) {
      console.error('API register user failed:', error);
      // Return API error message if available
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('User registration failed. Please try again.');
    }
  }

  const forgotPassword = async (email: string): Promise<{ success: boolean; message: string; newPassword?: string }> => {
    await new Promise((r) => setTimeout(r, 600))

    const users = getUsers();
    const foundUser = users.find(u => u.email === email);

    if (!foundUser) {
      // Return success even if user not found for security reasons
      return { success: true, message: 'If an account with that email exists, a new password has been sent.' };
    }

    // Generate a new random password
    const newPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();

    // Update user password
    const updatedUsers = users.map(u =>
      u.email === email ? { ...u, password: newPassword } : u
    );
    saveUsers(updatedUsers);

    // Store the new password temporarily in localStorage for demo purposes
    // In production, this would send an email
    localStorage.setItem('soma_reset_' + email, JSON.stringify({
      newPassword,
      expires: Date.now() + 3600000 // 1 hour
    }));

    return {
      success: true,
      message: 'New password generated! For demo purposes, the new password is: ' + newPassword + ' (In production, this would be sent to your email)',
      newPassword
    };
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem('soma_auth');
    localStorage.removeItem('soma_token');
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
    localStorage.removeItem('soma_token');
    localStorage.removeItem('soma_profile');
    localStorage.removeItem('soma_notifications');
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, registerUser: registerUserFn, signOut, updateUser, deleteAccount, forgotPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
