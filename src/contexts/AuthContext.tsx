// src/contexts/AuthContext.tsx
import { createContext } from "react"
import type { User } from "../types"

export interface AuthContextType {
  user: User | null
  token: string | null  // Add token property
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  updateUser: (user: User) => void  
  changePassword: (userId: string, currentPassword: string, newPassword: string) => Promise<boolean>; 
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined)
