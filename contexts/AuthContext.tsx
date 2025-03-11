"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (token: string, user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for stored auth data on component mount
    const storedToken = localStorage.getItem("token")
    const storedUserId = localStorage.getItem("userId")
    const storedUserData = localStorage.getItem("user")

    if (storedToken && storedUserId) {
      try {
        setToken(storedToken)

        // Try to parse stored user data if available
        if (storedUserData) {
          setUser(JSON.parse(storedUserData))
        } else {
          // Fallback to creating a minimal user object from userId
          setUser({
            id: storedUserId,
            name: "User",
            email: "",
          })
        }
      } catch (error) {
        console.error("Failed to parse stored user data:", error)
        // Clear invalid data
        localStorage.removeItem("token")
        localStorage.removeItem("userId")
        localStorage.removeItem("user")
      }
    }

    setIsLoading(false)
  }, [])

  const login = (newToken: string, newUser: User) => {
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem("token", newToken)
    localStorage.setItem("userId", newUser.id)
    localStorage.setItem("user", JSON.stringify(newUser))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    localStorage.removeItem("user")
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

