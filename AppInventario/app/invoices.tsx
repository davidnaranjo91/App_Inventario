"use client"

import { useState, useCallback } from "react"
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from "react-native"
import { useRouter } from "expo-router"
import { useAuth } from "../hooks/useAuth"
import { useFocusEffect } from "@react-navigation/native"

const API_URL = "http://localhost:3000/api"

export default function InvoicesScreen() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const router = useRouter()
  const { userId, username } = useAuth()

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        loadInvoices()
      }
    }, [userId]),
  )

  const loadInvoices = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/invoices/${userId}`)
      const data = await response.json()

      if (response.ok) {
        const sortedInvoices = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setInvoices(sortedInvoices)
      } else {
      }
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadInvoices()
    setRefreshing(false)
  }

  const viewInvoiceDetail = (invoiceId) => {
    router.push(`/invoice-detail?invoiceId=${invoiceId}`)
  }

  const renderInvoice = ({ item }) => (
    <TouchableOpacity
      className="bg-white p-4 mb-3 rounded-lg shadow-sm border border-gray-200"
      onPress={() => viewInvoiceDetail(item.id)}
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-semibold text-gray-800">{item.invoiceNumber}</Text>
        <Text className="text-lg font-bold text-green-600">${item.total.toFixed(2)}</Text>
      </View>

      <Text className="text-gray-700 font-medium">👤 {item.client.name}</Text>
      <Text className="text-gray-600">📞 {item.client.phone}</Text>
      <Text className="text-gray-600">📦 {item.items.length} producto(s)</Text>

      <Text className="text-gray-400 text-sm mt-2">
        {new Date(item.createdAt).toLocaleDateString()} - {new Date(item.createdAt).toLocaleTimeString()}
      </Text>

      <View className="flex-row justify-end mt-2">
        <Text className="text-blue-500 text-sm">Ver detalles →</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-green-500 pt-12 pb-4 px-4">
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => router.back()} className="mr-4">
                <Text className="text-white text-lg">← Volver</Text>
              </TouchableOpacity>
              <View>
                <Text className="text-white text-xl font-bold">Mis Facturas</Text>
                <Text className="text-green-100">Hola, {username}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View className="flex-1 px-4 pt-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold text-gray-800">Facturas ({invoices.length})</Text>
          <TouchableOpacity
            onPress={() => router.push("/create-invoice")}
            className="bg-green-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-semibold">+ Nueva Factura</Text>
          </TouchableOpacity>
        </View>

        {invoices.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500 text-center mb-4">No tienes facturas creadas</Text>
            <TouchableOpacity
              onPress={() => router.push("/create-invoice")}
              className="bg-green-500 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-semibold">Crear primera factura</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={invoices}
            renderItem={renderInvoice}
            keyExtractor={(item) => item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  )
}
