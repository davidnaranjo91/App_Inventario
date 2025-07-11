"use client"

import { useState, useCallback } from "react"
import { View, Text, FlatList, TouchableOpacity, Modal, RefreshControl } from "react-native"
import { useRouter } from "expo-router"
import { useAuth } from "../hooks/useAuth"
import { useFocusEffect } from "@react-navigation/native"

const API_URL = "http://localhost:3000/api"

export default function ClientsScreen() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)

  const [selectedClient, setSelectedClient] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const router = useRouter()
  const { userId, username } = useAuth()

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        loadClients()
      }
    }, [userId]),
  )

  const loadClients = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/clients/${userId}`)
      const data = await response.json()

      if (response.ok) {
        setClients(data)
      } else {
        showError("No se pudo cargar los clientes")
      }
    } catch (error) {
      showError("No se pudo conectar al servidor")
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadClients()
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

  const confirmDeleteClient = (client) => {
    setSelectedClient(client)
    setShowDeleteModal(true)
  }

  const deleteClient = async () => {
    if (!selectedClient) return

    try {
      const response = await fetch(`${API_URL}/clients/${userId}/${selectedClient.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setShowDeleteModal(false)
        loadClients()
        showSuccess(`El cliente "${selectedClient.name}" se eliminó correctamente`)
      } else {
        setShowDeleteModal(false)
        showError("No se pudo eliminar el cliente")
      }
    } catch (error) {
      setShowDeleteModal(false)
      showError("No se pudo conectar al servidor")
    }
  }

  const editClient = (clientId) => {
    router.push(`/edit-client?clientId=${clientId}`)
  }

  const renderClient = ({ item }) => (
    <View className="bg-white p-4 mb-3 rounded-lg shadow-sm border border-gray-200">
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-semibold text-gray-800 flex-1">{item.name}</Text>
      </View>
      <Text className="text-gray-600">📞 {item.phone}</Text>
      {item.email && <Text className="text-gray-600">📧 {item.email}</Text>}
      {item.address && <Text className="text-gray-600">📍 {item.address}</Text>}
      {item.createdAt && (
        <Text className="text-gray-400 text-sm mt-1">Agregado: {new Date(item.createdAt).toLocaleDateString()}</Text>
      )}
      {item.updatedAt && (
        <Text className="text-gray-400 text-sm">Actualizado: {new Date(item.updatedAt).toLocaleDateString()}</Text>
      )}

      <View className="flex-row justify-end gap-2 mt-3">
        <TouchableOpacity onPress={() => editClient(item.id)} className="bg-orange-500 px-3 py-2 rounded">
          <Text className="text-white text-sm font-medium">Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => confirmDeleteClient(item)} className="bg-red-500 px-3 py-2 rounded">
          <Text className="text-white text-sm font-medium">Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-purple-500 pt-12 pb-4 px-4">
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => router.back()} className="mr-4">
                <Text className="text-white text-lg">← Volver</Text>
              </TouchableOpacity>
              <View>
                <Text className="text-white text-xl font-bold">Mis Clientes</Text>
                <Text className="text-purple-100">Hola, {username}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View className="flex-1 px-4 pt-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold text-gray-800">Clientes ({clients.length})</Text>
          <TouchableOpacity onPress={() => router.push("/add-client")} className="bg-green-500 px-4 py-2 rounded-lg">
            <Text className="text-white font-semibold">+ Agregar</Text>
          </TouchableOpacity>
        </View>

        {clients.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500 text-center mb-4">No tienes clientes registrados</Text>
            <TouchableOpacity onPress={() => router.push("/add-client")} className="bg-purple-500 px-6 py-3 rounded-lg">
              <Text className="text-white font-semibold">Agregar primer cliente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={clients}
            renderItem={renderClient}
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
              ¿Estás seguro de que quieres eliminar a "{selectedClient?.name}"?
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-gray-300 rounded-lg py-3"
                onPress={() => setShowDeleteModal(false)}
              >
                <Text className="text-gray-700 text-center font-semibold">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-red-500 rounded-lg py-3" onPress={deleteClient}>
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
    </View>
  )
}
