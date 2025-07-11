"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native"
import { useRouter } from "expo-router"
import { useAuth } from "../hooks/useAuth"

const API_URL = "http://localhost:3000/api"

export default function LoginScreen() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Por favor completa todos los campos")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        await login(data.userId, data.username)
        router.replace("/inventory")
      } else {
        Alert.alert("Error", data.error || "Error al iniciar sesión")
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo conectar al servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-3xl font-bold text-center mb-8 text-gray-800">Inventario App</Text>

      <View className="mb-4">
        <Text className="text-gray-700 mb-2">Usuario</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3 text-base"
          value={username}
          onChangeText={setUsername}
          placeholder="Ingresa tu usuario"
          autoCapitalize="none"
        />
      </View>

      <View className="mb-6">
        <Text className="text-gray-700 mb-2">Contraseña</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3 text-base"
          value={password}
          onChangeText={setPassword}
          placeholder="Ingresa tu contraseña"
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        className={`bg-blue-500 rounded-lg py-3 mb-4 ${loading ? "opacity-50" : ""}`}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text className="text-white text-center text-lg font-semibold">
          {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity className="py-2" onPress={() => router.push("/register")}>
        <Text className="text-blue-500 text-center">¿No tienes cuenta? Regístrate aquí</Text>
      </TouchableOpacity>
    </View>
  )
}
