"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native"

const API_URL = "http://localhost:3000/api"

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (!username || !password || !confirmPassword) {
      Alert.alert("Error", "Por favor completa todos los campos")
      return
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden")
      return
    }

    if (password.length < 4) {
      Alert.alert("Error", "La contraseña debe tener al menos 4 caracteres")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        Alert.alert("Éxito", "Usuario registrado exitosamente", [
          { text: "OK", onPress: () => navigation.navigate("Login") },
        ])
      } else {
        Alert.alert("Error", data.error || "Error al registrar usuario")
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo conectar al servidor")
      console.error("Register error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-3xl font-bold text-center mb-8 text-gray-800">Registro</Text>

      <View className="mb-4">
        <Text className="text-gray-700 mb-2">Usuario</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3 text-base"
          value={username}
          onChangeText={setUsername}
          placeholder="Elige un nombre de usuario"
          autoCapitalize="none"
        />
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 mb-2">Contraseña</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3 text-base"
          value={password}
          onChangeText={setPassword}
          placeholder="Crea una contraseña"
          secureTextEntry
        />
      </View>

      <View className="mb-6">
        <Text className="text-gray-700 mb-2">Confirmar Contraseña</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3 text-base"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirma tu contraseña"
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        className={`bg-green-500 rounded-lg py-3 mb-4 ${loading ? "opacity-50" : ""}`}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text className="text-white text-center text-lg font-semibold">
          {loading ? "Registrando..." : "Registrarse"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity className="py-2" onPress={() => navigation.navigate("Login")}>
        <Text className="text-blue-500 text-center">¿Ya tienes cuenta? Inicia sesión aquí</Text>
      </TouchableOpacity>
    </View>
  )
}
