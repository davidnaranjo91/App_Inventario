"use client"

import { useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity, Modal } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useAuth } from "../hooks/useAuth"

const API_URL = "http://localhost:3000/api"

export default function InvoiceDetailScreen() {
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const router = useRouter()
  const { userId } = useAuth()
  const { invoiceId } = useLocalSearchParams()

  useEffect(() => {

    if (invoiceId && userId) {
      loadInvoice()
    } else {
      showError("Error: Faltan parámetros necesarios")
    }
  }, [invoiceId, userId])

  const showError = (message) => {
    setErrorMessage(message)
    setShowErrorModal(true)
  }

  const loadInvoice = async () => {

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/invoices/${userId}/${invoiceId}`)

      if (response.ok) {
        const data = await response.json()
        setInvoice(data)
      } else {
        const errorData = await response.json()
        showError(`Error ${response.status}: ${errorData.error || "No se pudo cargar la factura"}`)
      }
    } catch (error) {
      showError("No se pudo conectar al servidor. Verifica que el backend esté funcionando.")
    } finally {
      setLoading(false)
    }
  }

  const handleErrorOk = () => {
    setShowErrorModal(false)
    router.back()
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    }
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-gray-600">Cargando factura...</Text>
        <Text className="text-sm text-gray-400 mt-2">ID: {invoiceId}</Text>
      </View>
    )
  }

  if (!invoice) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-red-600">Factura no encontrada</Text>
        <TouchableOpacity className="mt-4 bg-blue-500 px-6 py-3 rounded-lg" onPress={() => router.back()}>
          <Text className="text-white font-semibold">Volver</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const { date, time } = formatDate(invoice.createdAt)

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-blue-500 pt-12 pb-4 px-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Text className="text-white text-lg">← Volver</Text>
          </TouchableOpacity>
          <View>
            <Text className="text-white text-xl font-bold">Detalle de Factura</Text>
            <Text className="text-blue-100">{invoice.invoiceNumber}</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        <View className="bg-white p-4 rounded-lg mb-4 shadow-sm">
          <Text className="text-xl font-bold text-gray-800 mb-2">{invoice.invoiceNumber}</Text>
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-600">Fecha:</Text>
            <Text className="text-gray-800 font-medium">{date}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Hora:</Text>
            <Text className="text-gray-800 font-medium">{time}</Text>
          </View>
        </View>

        <View className="bg-white p-4 rounded-lg mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">👤 Información del Cliente</Text>
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Nombre:</Text>
              <Text className="text-gray-800 font-medium flex-1 text-right">{invoice.client.name}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Teléfono:</Text>
              <Text className="text-gray-800 font-medium">{invoice.client.phone}</Text>
            </View>
            {invoice.client.email && (
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Email:</Text>
                <Text className="text-gray-800 font-medium flex-1 text-right">{invoice.client.email}</Text>
              </View>
            )}
            {invoice.client.address && (
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Dirección:</Text>
                <Text className="text-gray-800 font-medium flex-1 text-right">{invoice.client.address}</Text>
              </View>
            )}
          </View>
        </View>

        <View className="bg-white p-4 rounded-lg mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">📦 Productos Vendidos</Text>
          {invoice.items.map((item, index) => (
            <View key={index} className="border-b border-gray-200 pb-3 mb-3 last:border-b-0 last:mb-0">
              <Text className="text-lg font-medium text-gray-800">{item.productName}</Text>
              <View className="flex-row justify-between mt-1">
                <Text className="text-gray-600">Cantidad:</Text>
                <Text className="text-gray-800">{item.quantity}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Precio unitario:</Text>
                <Text className="text-gray-800">${item.unitPrice.toFixed(2)}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600 font-medium">Subtotal:</Text>
                <Text className="text-gray-800 font-semibold">${item.total.toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>

        <View className="bg-white p-4 rounded-lg mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">💰 Resumen</Text>
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Productos:</Text>
              <Text className="text-gray-800">{invoice.items.length}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Cantidad total:</Text>
              <Text className="text-gray-800">
                {invoice.items.reduce((total, item) => total + item.quantity, 0)} unidades
              </Text>
            </View>
            <View className="border-t border-gray-200 pt-2">
              <View className="flex-row justify-between">
                <Text className="text-lg font-semibold text-gray-800">Total:</Text>
                <Text className="text-xl font-bold text-green-600">${invoice.total.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="bg-white p-4 border-t border-gray-200">
        <View className="flex-row gap-3">
          <TouchableOpacity className="flex-1 bg-gray-300 rounded-lg py-3" onPress={() => router.back()}>
            <Text className="text-gray-700 text-center font-semibold">Volver a Facturas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-blue-500 rounded-lg py-3"
            onPress={() => router.push("/create-invoice")}
          >
            <Text className="text-white text-center font-semibold">Nueva Factura</Text>
          </TouchableOpacity>
        </View>
      </View>

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
