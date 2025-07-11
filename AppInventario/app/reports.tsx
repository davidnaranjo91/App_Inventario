"use client"

import { useState, useCallback } from "react"
import { View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl, Modal } from "react-native"
import { useRouter } from "expo-router"
import { useAuth } from "../hooks/useAuth"
import { useFocusEffect } from "@react-navigation/native"

const API_URL = "http://localhost:3000/api"

export default function ReportsScreen() {
  const [salesReport, setSalesReport] = useState([])
  const [productSummary, setProductSummary] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("sales") // "sales" o "summary"
  const [showFilterModal, setShowFilterModal] = useState(false)

  const router = useRouter()
  const { userId, username } = useAuth()

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        loadReports()
      }
    }, [userId]),
  )

  const loadReports = async (productFilter = "") => {
    setLoading(true)
    try {
      const salesUrl = `${API_URL}/reports/sales/${userId}${productFilter ? `?productName=${encodeURIComponent(productFilter)}` : ""}`
      const salesResponse = await fetch(salesUrl)

      if (salesResponse.ok) {
        const salesData = await salesResponse.json()
        setSalesReport(salesData)
      }

      const summaryResponse = await fetch(`${API_URL}/reports/summary/${userId}`)
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json()
        setProductSummary(summaryData)
      }
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadReports(searchQuery)
    setRefreshing(false)
  }

  const handleSearch = () => {
    loadReports(searchQuery)
    setShowFilterModal(false)
  }

  const clearSearch = () => {
    setSearchQuery("")
    loadReports("")
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  }

  const renderSaleItem = ({ item }) => {
    const { date, time } = formatDate(item.saleDate)

    return (
      <View className="bg-white p-4 mb-3 rounded-lg shadow-sm border border-gray-200">
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-lg font-semibold text-gray-800 flex-1">{item.productName}</Text>
          <Text className="text-lg font-bold text-green-600">${item.totalSale.toFixed(2)}</Text>
        </View>

        <View className="space-y-1">
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Factura:</Text>
            <Text className="text-blue-600 font-medium">{item.invoiceNumber}</Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-gray-600">Cliente:</Text>
            <Text className="text-gray-800 font-medium">{item.client.name}</Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-gray-600">Teléfono:</Text>
            <Text className="text-gray-800">{item.client.phone}</Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-gray-600">Cantidad vendida:</Text>
            <Text className="text-orange-600 font-semibold">{item.quantitySold} unidades</Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-gray-600">Precio unitario:</Text>
            <Text className="text-gray-800">${item.unitPrice.toFixed(2)}</Text>
          </View>
        </View>

        <View className="border-t border-gray-200 mt-2 pt-2">
          <Text className="text-gray-400 text-sm text-right">
            {date} - {time}
          </Text>
        </View>
      </View>
    )
  }

  const renderSummaryItem = ({ item }) => (
    <View className="bg-white p-4 mb-3 rounded-lg shadow-sm border border-gray-200">
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-semibold text-gray-800 flex-1">{item.productName}</Text>
        <Text className="text-lg font-bold text-green-600">${item.totalRevenue.toFixed(2)}</Text>
      </View>

      <View className="grid grid-cols-2 gap-2">
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Total vendido:</Text>
          <Text className="text-orange-600 font-semibold">{item.totalQuantitySold} unidades</Text>
        </View>

        <View className="flex-row justify-between">
          <Text className="text-gray-600">Ventas realizadas:</Text>
          <Text className="text-blue-600 font-medium">{item.salesCount}</Text>
        </View>

        <View className="flex-row justify-between">
          <Text className="text-gray-600">Precio promedio:</Text>
          <Text className="text-gray-800">${item.averagePrice.toFixed(2)}</Text>
        </View>

        <View className="flex-row justify-between">
          <Text className="text-gray-600">Promedio por venta:</Text>
          <Text className="text-gray-800">{(item.totalQuantitySold / item.salesCount).toFixed(1)} unidades</Text>
        </View>
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
                <Text className="text-white text-xl font-bold">Reportes de Ventas</Text>
                <Text className="text-purple-100">Hola, {username}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity onPress={() => setShowFilterModal(true)} className="bg-purple-600 px-4 py-2 rounded">
            <Text className="text-white">Filtrar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="bg-white px-4 py-2 border-b border-gray-200">
        <View className="flex-row">
          <TouchableOpacity
            className={`flex-1 py-3 ${activeTab === "sales" ? "border-b-2 border-purple-500" : ""}`}
            onPress={() => setActiveTab("sales")}
          >
            <Text
              className={`text-center font-semibold ${activeTab === "sales" ? "text-purple-500" : "text-gray-600"}`}
            >
              Ventas Detalladas ({salesReport.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 ${activeTab === "summary" ? "border-b-2 border-purple-500" : ""}`}
            onPress={() => setActiveTab("summary")}
          >
            <Text
              className={`text-center font-semibold ${activeTab === "summary" ? "text-purple-500" : "text-gray-600"}`}
            >
              Resumen por Producto ({productSummary.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {searchQuery && (
        <View className="bg-blue-50 px-4 py-2 border-b border-blue-200">
          <View className="flex-row justify-between items-center">
            <Text className="text-blue-700">🔍 Filtrado por: "{searchQuery}"</Text>
            <TouchableOpacity onPress={clearSearch}>
              <Text className="text-blue-500 font-medium">Limpiar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View className="flex-1 px-4 pt-4">
        {activeTab === "sales" ? (
          salesReport.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <Text className="text-gray-500 text-center mb-4">
                {searchQuery ? `No se encontraron ventas para "${searchQuery}"` : "No hay ventas registradas"}
              </Text>
              {!searchQuery && (
                <TouchableOpacity
                  onPress={() => router.push("/create-invoice")}
                  className="bg-purple-500 px-6 py-3 rounded-lg"
                >
                  <Text className="text-white font-semibold">Crear primera factura</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <FlatList
              data={salesReport}
              renderItem={renderSaleItem}
              keyExtractor={(item, index) => `${item.invoiceId}-${item.productId}-${index}`}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              showsVerticalScrollIndicator={false}
            />
          )
        ) : productSummary.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500 text-center mb-4">No hay datos de resumen disponibles</Text>
            <TouchableOpacity
              onPress={() => router.push("/create-invoice")}
              className="bg-purple-500 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-semibold">Crear primera factura</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={productSummary}
            renderItem={renderSummaryItem}
            keyExtractor={(item) => item.productId}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-center">
          <View className="bg-white mx-4 rounded-lg p-6">
            <Text className="text-xl font-bold text-gray-800 mb-4">Filtrar por Producto</Text>

            <Text className="text-gray-700 mb-2">Nombre del producto:</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base mb-4"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Ej: Laptop, Mouse, etc."
              autoFocus
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-gray-300 rounded-lg py-3"
                onPress={() => setShowFilterModal(false)}
              >
                <Text className="text-gray-700 text-center font-semibold">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-purple-500 rounded-lg py-3" onPress={handleSearch}>
                <Text className="text-white text-center font-semibold">Buscar</Text>
              </TouchableOpacity>
            </View>

            {searchQuery && (
              <TouchableOpacity className="mt-3 py-2" onPress={clearSearch}>
                <Text className="text-purple-500 text-center">Limpiar filtro</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  )
}
