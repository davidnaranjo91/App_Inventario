"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native"

const API_URL = "http://localhost:3000/api"

export default function AddProductScreen({ navigation, userId }) {
  const [name, setName] = useState("")
  const [quantity, setQuantity] = useState("")
  const [price, setPrice] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAddProduct = async () => {
    if (!name || !quantity || !price) {
      Alert.alert("Error", "Por favor completa todos los campos")
      return
    }

    if (isNaN(quantity) || Number.parseInt(quantity) < 0) {
      Alert.alert("Error", "La cantidad debe ser un número válido")
      return
    }

    if (isNaN(price) || Number.parseFloat(price) < 0) {
      Alert.alert("Error", "El precio debe ser un número válido")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/inventory/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          quantity: Number.parseInt(quantity),
          price: Number.parseFloat(price),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        Alert.alert("Éxito", "Producto agregado exitosamente", [{ text: "OK", onPress: () => navigation.goBack() }])
      } else {
        Alert.alert("Error", data.error || "Error al agregar producto")
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo conectar al servidor")
      console.error("Add product error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-green-500 pt-12 pb-4 px-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Text className="text-white text-lg">← Volver</Text>
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Agregar Producto</Text>
        </View>
      </View>

      {/* Form */}
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
      </View>
    </View>
  )
}
