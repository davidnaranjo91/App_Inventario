"use client"

import { useState, useCallback } from "react"
import { View, Text, FlatList, TouchableOpacity, Modal, RefreshControl } from "react-native"
import { useRouter } from "expo-router"
import { useAuth } from "../hooks/useAuth"
import { useFocusEffect } from "@react-navigation/native"

const API_URL = "http://localhost:3000/api"

export default function InventoryScreen() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const [selectedProduct, setSelectedProduct] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const router = useRouter()
  const { userId, username, logout } = useAuth()

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        loadInventory()
      }
    }, [userId]),
  )

  const loadInventory = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/inventory/${userId}`)
      const data = await response.json()

      if (response.ok) {
        setProducts(data)
      } else {
        showError("No se pudo cargar el inventario")
      }
    } catch (error) {
      showError("No se pudo conectar al servidor")
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadInventory()
    setRefreshing(false)
  }

  const showSuccess = (message) => {
    setSuccessMessage(message)
    setShowSuccessModal(true)
  }

  const showError = (message) => {
    setErrorMessage(message)
    setShowErrorModal(true)
  }

  const confirmDeleteProduct = (product) => {
    setSelectedProduct(product)
    setShowDeleteModal(true)
  }

  const deleteProduct = async () => {
    if (!selectedProduct) return

    try {
      const response = await fetch(`${API_URL}/inventory/${userId}/${selectedProduct.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setShowDeleteModal(false)
        loadInventory()
        showSuccess(`El producto "${selectedProduct.name}" se eliminó correctamente`)
      } else {
        setShowDeleteModal(false)
        showError("No se pudo eliminar el producto")
      }
    } catch (error) {
      setShowDeleteModal(false)
      showError("No se pudo conectar al servidor")
    }
  }

  const editProduct = (productId) => {
    router.push(`/edit-product?productId=${productId}`)
  }

  const confirmLogout = () => {
    setShowLogoutModal(true)
  }

  const handleLogout = async () => {
    setShowLogoutModal(false)
    await logout()
    router.replace("/login")
  }

  const renderProduct = ({ item }) => (
    <View className="bg-white p-4 mb-3 rounded-lg shadow-sm border border-gray-200">
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-semibold text-gray-800 flex-1">{item.name}</Text>
        {item.quantity === 0 && (
          <View className="bg-red-100 px-2 py-1 rounded">
            <Text className="text-red-600 text-xs font-semibold">SIN STOCK</Text>
          </View>
        )}
      </View>
      <Text className={`${item.quantity <= 5 && item.quantity > 0 ? "text-orange-600" : "text-gray-600"}`}>
        Cantidad: {item.quantity} {item.quantity <= 5 && item.quantity > 0 }
      </Text>
      <Text className="text-gray-600">Precio: ${item.price}</Text>
      {item.createdAt && (
        <Text className="text-gray-400 text-sm mt-1">Agregado: {new Date(item.createdAt).toLocaleDateString()}</Text>
      )}
      {item.updatedAt && (
        <Text className="text-gray-400 text-sm">Actualizado: {new Date(item.updatedAt).toLocaleDateString()}</Text>
      )}

      <View className="flex-row justify-end gap-2 mt-3">
        <TouchableOpacity onPress={() => editProduct(item.id)} className="bg-orange-500 px-3 py-2 rounded">
          <Text className="text-white text-sm font-medium">Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => confirmDeleteProduct(item)} className="bg-red-500 px-3 py-2 rounded">
          <Text className="text-white text-sm font-medium">Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-blue-500 pt-12 pb-4 px-4">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-xl font-bold">Mi Inventario</Text>
            <Text className="text-blue-100">Hola, {username}</Text>
          </View>
          <View className="flex-row gap-1">
            <TouchableOpacity onPress={() => router.push("/reports")} className="bg-purple-500 px-3 py-2 rounded">
              <Text className="text-white text-sm">Reportes</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/invoices")} className="bg-green-500 px-3 py-2 rounded">
              <Text className="text-white text-sm">Facturas</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/clients")} className="bg-orange-500 px-3 py-2 rounded">
              <Text className="text-white text-sm">Clientes</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={confirmLogout} className="bg-blue-600 px-3 py-2 rounded">
              <Text className="text-white text-sm">Salir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View className="flex-1 px-4 pt-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold text-gray-800">Productos ({products.length})</Text>
          <TouchableOpacity onPress={() => router.push("/add-product")} className="bg-green-500 px-4 py-2 rounded-lg">
            <Text className="text-white font-semibold">+ Agregar</Text>
          </TouchableOpacity>
        </View>

        {products.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500 text-center mb-4">No tienes productos en tu inventario</Text>
            <TouchableOpacity onPress={() => router.push("/add-product")} className="bg-blue-500 px-6 py-3 rounded-lg">
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

      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white rounded-lg p-6 mx-4 w-80">
            <Text className="text-xl font-bold text-red-600 text-center mb-4">Confirmar Eliminación</Text>
            <Text className="text-gray-700 text-center mb-6">
              ¿Estás seguro de que quieres eliminar "{selectedProduct?.name}"?
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-gray-300 rounded-lg py-3"
                onPress={() => setShowDeleteModal(false)}
              >
                <Text className="text-gray-700 text-center font-semibold">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-red-500 rounded-lg py-3" onPress={deleteProduct}>
                <Text className="text-white text-center font-semibold">Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
            <TouchableOpacity className="bg-green-500 rounded-lg py-3" onPress={() => setShowSuccessModal(false)}>
              <Text className="text-white text-center font-semibold">OK</Text>
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

      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white rounded-lg p-6 mx-4 w-80">
            <Text className="text-xl font-bold text-blue-600 text-center mb-4">Cerrar Sesión</Text>
            <Text className="text-gray-700 text-center mb-6">¿Estás seguro de que quieres cerrar sesión?</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-gray-300 rounded-lg py-3"
                onPress={() => setShowLogoutModal(false)}
              >
                <Text className="text-gray-700 text-center font-semibold">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-blue-500 rounded-lg py-3" onPress={handleLogout}>
                <Text className="text-white text-center font-semibold">Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
  
}
