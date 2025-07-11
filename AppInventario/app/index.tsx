"use client"

import { useEffect } from "react"
import { View, Text } from "react-native"
import { useRouter } from "expo-router"
import { useAuth } from "../hooks/useAuth"

export default function Index() {
  const router = useRouter()
  const { isLoggedIn, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (isLoggedIn) {
        router.replace("/inventory")
      } else {
        router.replace("/login")
      }
    }
  }, [isLoggedIn, loading])

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-gray-600">Cargando...</Text>
      </View>
    )
  }

  return null
}
