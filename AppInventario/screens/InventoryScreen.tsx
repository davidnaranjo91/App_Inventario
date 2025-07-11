"use client"

import { useState, useEffect } from "react"
import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl } from "react-native"

const API_URL = "http://localhost:3000/api"

export default function InventoryScreen({ navigation, userId, username, onLogout }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadInventory()
  }, [])

  const loadInventory = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/inventory/${userId}`)
      const data = await response.json()

      if (response.ok) {
        setProducts(data)
      } else {
        Alert.alert("Error", "No se pudo cargar el inventario")
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo conectar al servidor")
      console.error("Load inventory error:", error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadInventory()
    setRefreshing(false)
  }

  const deleteProduct = async (productId) => {
    Alert.alert("Confirmar eliminación", "¿Estás seguro de que quieres eliminar este producto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(`${API_URL}/inventory/${userId}/${productId}`, {
              method: "DELETE",
            })

            if (response.ok) {
              loadInventory()
            } else {
              Alert.alert("Error", "No se pudo eliminar el producto")
            }
          } catch (error) {
            Alert.alert("Error", "No se pudo conectar al servidor")
          }
        },
      },
    ])
  }

  const renderProduct = ({ item }) => (
    <View className="bg-white p-4 mb-3 rounded-lg shadow-sm border border-gray-200">
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-semibold text-gray-800 flex-1">{item.name}</Text>
        <TouchableOpacity onPress={() => deleteProduct(item.id)} className="bg-red-500 px-3 py-1 rounded">
          <Text className="text-white text-sm">Eliminar</Text>
        </TouchableOpacity>
      </View>
      <Text className="text-gray-600">Cantidad: {item.quantity}</Text>
      <Text className="text-gray-600">Precio: ${item.price}</Text>
      {item.createdAt && (
        <Text className="text-gray-400 text-sm mt-1">Agregado: {new Date(item.createdAt).toLocaleDateString()}</Text>
      )}
    </View>
  )

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-500 pt-12 pb-4 px-4">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-xl font-bold">Mi Inventario</Text>
            <Text className="text-blue-100">Hola, {username}</Text>
          </View>
          <TouchableOpacity onPress={onLogout} className="bg-blue-600 px-4 py-2 rounded">
            <Text className="text-white">Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 px-4 pt-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold text-gray-800">Productos ({products.length})</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("AddProduct")}
            className="bg-green-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-semibold">+ Agregar</Text>
          </TouchableOpacity>
        </View>

        {products.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500 text-center mb-4">No tienes productos en tu inventario</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("AddProduct")}
              className="bg-blue-500 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-semibold">Agregar primer producto</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  )
}
