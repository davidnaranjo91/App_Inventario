"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, Modal } from "react-native"
import { useRouter } from "expo-router"
import { useAuth } from "../hooks/useAuth"

const API_URL = "http://localhost:3000/api"

export default function AddProductScreen() {
  const [name, setName] = useState("")
  const [quantity, setQuantity] = useState("")
  const [price, setPrice] = useState("")
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

  const handleAddProduct = async () => {

    if (!name || !quantity || !price) {
      showError("Por favor completa todos los campos")
      return
    }

    if (isNaN(Number(quantity)) || Number.parseInt(quantity) < 0) {
      showError("La cantidad debe ser un número válido")
      return
    }

    if (isNaN(Number(price)) || Number.parseFloat(price) < 0) {
      showError("El precio debe ser un número válido")
      return
    }

    setLoading(true)

    try {
      const requestBody = {
        name: name.trim(),
        quantity: Number.parseInt(quantity),
        price: Number.parseFloat(price),
      }

      const response = await fetch(`${API_URL}/inventory/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (response.ok) {
        showSuccess(`¡Éxito! El producto "${name.trim()}" se agregó correctamente a tu inventario`)
      } else {
        showError(data.error || "Error al agregar producto")
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
    setQuantity("")
    setPrice("")
    router.replace("/inventory")
  }

  return (
    <View className="flex-1 bg-white">
      <View className="bg-green-500 pt-12 pb-4 px-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Text className="text-white text-lg">← Volver</Text>
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Agregar Producto</Text>
        </View>
      </View>

      <View className="flex-1 px-6 pt-6">
        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-semibold">Nombre del Producto</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base"
            value={name}
            onChangeText={setName}
            placeholder="Ej: Laptop Dell"
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-semibold">Cantidad</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base"
            value={quantity}
            onChangeText={setQuantity}
            placeholder="Ej: 5"
            keyboardType="numeric"
          />
        </View>

        <View className="mb-6">
          <Text className="text-gray-700 mb-2 font-semibold">Precio</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base"
            value={price}
            onChangeText={setPrice}
            placeholder="Ej: 999.99"
            keyboardType="decimal-pad"
          />
        </View>

        <TouchableOpacity
          className={`bg-green-500 rounded-lg py-4 ${loading ? "opacity-50" : ""}`}
          onPress={handleAddProduct}
          disabled={loading}
        >
          <Text className="text-white text-center text-lg font-semibold">
            {loading ? "Agregando..." : "Agregar Producto"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="mt-4 py-3" onPress={() => router.push("/inventory")}>
          <Text className="text-green-500 text-center font-medium">Ver mi inventario</Text>
        </TouchableOpacity>
      </View>

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
              <Text className="text-white text-center font-semibold">Ver Inventario</Text>
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
