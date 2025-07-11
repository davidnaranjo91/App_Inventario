"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useAuth } from "../hooks/useAuth"

const API_URL = "http://localhost:3000/api"

export default function EditClientScreen() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingClient, setLoadingClient] = useState(true)

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const router = useRouter()
  const { userId } = useAuth()
  const { clientId } = useLocalSearchParams()

  useEffect(() => {

    if (clientId && userId) {
      loadClient()
    } else {
      showError("Error: Faltan parámetros necesarios")
    }
  }, [clientId, userId])

  const showSuccess = (message) => {
    setSuccessMessage(message)
    setShowSuccessModal(true)
  }

  const showError = (message) => {
    setErrorMessage(message)
    setShowErrorModal(true)
  }

  const loadClient = async () => {
    setLoadingClient(true)
    try {
      const response = await fetch(`${API_URL}/clients/${userId}/${clientId}`)

      if (response.ok) {
        const data = await response.json()

        setName(data.name)
        setPhone(data.phone)
        setEmail(data.email || "")
        setAddress(data.address || "")
      } else {
        const errorData = await response.json()
        showError(`Error ${response.status}: ${errorData.error || "No se pudo cargar el cliente"}`)
      }
    } catch (error) {
      showError("No se pudo conectar al servidor. Verifica que el backend esté funcionando.")
    } finally {
      setLoadingClient(false)
    }
  }

  const handleUpdateClient = async () => {

    if (!name || !phone) {
      showError("Por favor completa el nombre y teléfono (campos obligatorios)")
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

      const response = await fetch(`${API_URL}/clients/${userId}/${clientId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (response.ok) {
        showSuccess(`¡Cliente actualizado! Los cambios se verán reflejados en tu lista de clientes.`)
      } else {
        showError(data.error || "Error al actualizar cliente")
      }
    } catch (error) {
      showError("No se pudo conectar al servidor")
    } finally {
      setLoading(false)
    }
  }

  const handleSuccessOk = () => {
    setShowSuccessModal(false)
    router.back()
  }

  const handleErrorOk = () => {
    setShowErrorModal(false)
    if (loadingClient === false && !name && !phone) {
      router.back()
    }
  }

  if (loadingClient) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-gray-600">Cargando cliente...</Text>
        <Text className="text-sm text-gray-400 mt-2">ID: {clientId}</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-white">
      <View className="bg-orange-500 pt-12 pb-4 px-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Text className="text-white text-lg">← Volver</Text>
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Editar Cliente</Text>
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
          className={`bg-orange-500 rounded-lg py-4 ${loading ? "opacity-50" : ""}`}
          onPress={handleUpdateClient}
          disabled={loading}
        >
          <Text className="text-white text-center text-lg font-semibold">
            {loading ? "Actualizando..." : "Actualizar Cliente"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="mt-4 py-3" onPress={() => router.back()}>
          <Text className="text-orange-500 text-center font-medium">Cancelar</Text>
        </TouchableOpacity>

        <View className="mt-4 p-3 bg-gray-100 rounded mb-6">
          <Text className="text-xs text-gray-600">Debug Info:</Text>
          <Text className="text-xs text-gray-600">Client ID: {clientId}</Text>
          <Text className="text-xs text-gray-600">User ID: {userId}</Text>
          <Text className="text-xs text-gray-600 mt-2">
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
              <Text className="text-white text-center font-semibold">Ver Clientes Actualizados</Text>
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
            <TouchableOpacity className="bg-red-500 rounded-lg py-3" onPress={handleErrorOk}>
              <Text className="text-white text-center font-semibold">Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}
