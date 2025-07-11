"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, Modal } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useAuth } from "../hooks/useAuth"

const API_URL = "http://localhost:3000/api"

export default function EditProductScreen() {
  const [name, setName] = useState("")
  const [quantity, setQuantity] = useState("")
  const [price, setPrice] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingProduct, setLoadingProduct] = useState(true)

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const router = useRouter()
  const { userId } = useAuth()
  const { productId } = useLocalSearchParams()

  useEffect(() => {
    if (productId && userId) {
      loadProduct()
    } else {
      showError("Error: Faltan parámetros necesarios")
    }
  }, [productId, userId])

  const showSuccess = (message) => {
    setSuccessMessage(message)
    setShowSuccessModal(true)
  }

  const showError = (message) => {
    setErrorMessage(message)
    setShowErrorModal(true)
  }

  const loadProduct = async () => {
    setLoadingProduct(true)
    try {
      const response = await fetch(`${API_URL}/inventory/${userId}/${productId}`)
      if (response.ok) {
        const data = await response.json()
        setName(data.name)
        setQuantity(data.quantity.toString())
        setPrice(data.price.toString())
      } else {
        const errorData = await response.json()
        showError(`Error ${response.status}: ${errorData.error || "No se pudo cargar el producto"}`)
      }
    } catch (error) {
      showError("No se pudo conectar al servidor. Verifica que el backend esté funcionando.")
    } finally {
      setLoadingProduct(false)
    }
  }

  const handleUpdateProduct = async () => {
    if (!name || !quantity || !price) {
      showError("Por favor completa todos los campos")
      return
    }

    if (isNaN(Number(quantity)) || Number(quantity) < 0) {
      showError("La cantidad debe ser un número válido")
      return
    }

    if (isNaN(Number(price)) || Number(price) < 0) {
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
      const response = await fetch(`${API_URL}/inventory/${userId}/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()
      if (response.ok) {
        showSuccess(`¡Producto actualizado! Los cambios se verán reflejados en tu inventario.`)
      } else {
        showError(data.error || "Error al actualizar producto")
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
    if (loadingProduct === false && !name && !quantity && !price) {
      router.back()
    }
  }

  if (loadingProduct) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-gray-600">Cargando producto...</Text>
        <Text className="text-sm text-gray-400 mt-2">ID: {productId}</Text>
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
          <Text className="text-white text-xl font-bold">Editar Producto</Text>
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
          className={`bg-orange-500 rounded-lg py-4 ${loading ? "opacity-50" : ""}`}
          onPress={handleUpdateProduct}
          disabled={loading}
        >
          <Text className="text-white text-center text-lg font-semibold">
            {loading ? "Actualizando..." : "Actualizar Producto"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="mt-4 py-3" onPress={() => router.back()}>
          <Text className="text-orange-500 text-center font-medium">Cancelar</Text>
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
              <Text className="text-white text-center font-semibold">Ver Inventario Actualizado</Text>
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
