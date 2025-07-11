"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface AuthContextType {
  isLoggedIn: boolean
  userId: string | null
  username: string | null
  loading: boolean
  login: (userId: string, username: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkLoginStatus()
  }, [])

  const checkLoginStatus = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("userId")
      const storedUsername = await AsyncStorage.getItem("username")

      if (storedUserId && storedUsername) {
        setUserId(storedUserId)
        setUsername(storedUsername)
        setIsLoggedIn(true)
      }
    } catch (error) {
      console.error("Error checking login status:", error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (userId: string, username: string) => {
    try {
      await AsyncStorage.setItem("userId", userId)
      await AsyncStorage.setItem("username", username)
      setUserId(userId)
      setUsername(username)
      setIsLoggedIn(true)
    } catch (error) {
      console.error("Error saving login data:", error)
    }
  }

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("userId")
      await AsyncStorage.removeItem("username")
      setUserId(null)
      setUsername(null)
      setIsLoggedIn(false)
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, userId, username, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
