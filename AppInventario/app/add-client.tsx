"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView } from "react-native"
import { useRouter } from "expo-router"
import { useAuth } from "../hooks/useAuth"

const API_URL = "http://localhost:3000/api"

export default function AddClientScreen() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const router = useRouter()
  const { userId } = useAuth()

  const showSuccess = (message) => {
    setSuccessMessage(message)
    setShowSuccessModal(true)
  }

  const showError = (message) => {
    setErrorMessage(message)
    setShowErrorModal(true)
  }

  const handleAddClient = async () => {
    if (!name || !phone) {
      showError("Los campos con (*) son obligatorios)")
      return
    }

    setLoading(true)

    try {
      const requestBody = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
      }


      const response = await fetch(`${API_URL}/clients/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (response.ok) {
        showSuccess(`¡Éxito! El cliente "${name.trim()}" se agregó correctamente`)
      } else {
        showError(data.error || "Error al agregar cliente")
      }
    } catch (error) {
      showError("No se pudo conectar al servidor. Verifica que el backend esté funcionando.")
    } finally {
      setLoading(false)
    }
  }

  const handleSuccessOk = () => {
    setShowSuccessModal(false)
    
    setName("")
    setPhone("")
    setEmail("")
    setAddress("")
    router.replace("/clients")
  }

  return (
    <View className="flex-1 bg-white">
      <View className="bg-green-500 pt-12 pb-4 px-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Text className="text-white text-lg">← Volver</Text>
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Agregar Cliente</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-semibold">
            Nombre Completo <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base"
            value={name}
            onChangeText={setName}
            placeholder="Ej: Juan Pérez"
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-semibold">
            Teléfono <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base"
            value={phone}
            onChangeText={setPhone}
            placeholder="Ej: +1234567890"
            keyboardType="phone-pad"
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-semibold">Email (Opcional)</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base"
            value={email}
            onChangeText={setEmail}
            placeholder="Ej: juan@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View className="mb-6">
          <Text className="text-gray-700 mb-2 font-semibold">Dirección (Opcional)</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base"
            value={address}
            onChangeText={setAddress}
            placeholder="Ej: Calle 123, Ciudad"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          className={`bg-green-500 rounded-lg py-4 ${loading ? "opacity-50" : ""}`}
          onPress={handleAddClient}
          disabled={loading}
        >
          <Text className="text-white text-center text-lg font-semibold">
            {loading ? "Agregando..." : "Agregar Cliente"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="mt-4 py-3 mb-6" onPress={() => router.push("/clients")}>
          <Text className="text-green-500 text-center font-medium">Ver mis clientes</Text>
        </TouchableOpacity>

        <View className="mb-4 p-3 bg-gray-100 rounded">
          <Text className="text-xs text-gray-600 text-center">
            Los campos marcados con <Text className="text-red-500">*</Text> son obligatorios
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white rounded-lg p-6 mx-4 w-80">
            <Text className="text-xl font-bold text-green-600 text-center mb-4">¡Éxito!</Text>
            <Text className="text-gray-700 text-center mb-6">{successMessage}</Text>
            <TouchableOpacity className="bg-green-500 rounded-lg py-3" onPress={handleSuccessOk}>
              <Text className="text-white text-center font-semibold">Ver Clientes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showErrorModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white rounded-lg p-6 mx-4 w-80">
            <Text className="text-xl font-bold text-red-600 text-center mb-4">Error</Text>
            <Text className="text-gray-700 text-center mb-6">{errorMessage}</Text>
            <TouchableOpacity className="bg-red-500 rounded-lg py-3" onPress={() => setShowErrorModal(false)}>
              <Text className="text-white text-center font-semibold">Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}
