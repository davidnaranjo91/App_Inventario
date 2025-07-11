"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, Modal, FlatList, TextInput, ScrollView } from "react-native"
import { useRouter } from "expo-router"
import { useAuth } from "../hooks/useAuth"

const API_URL = "http://localhost:3000/api"

export default function CreateInvoiceScreen() {
  const [clients, setClients] = useState([])
  const [products, setProducts] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [loading, setLoading] = useState(false)

  const [showClientModal, setShowClientModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const router = useRouter()
  const { userId } = useAuth()

  useEffect(() => {
    if (userId) {
      loadClients()
      loadProducts()
    }
  }, [userId])

  const loadClients = async () => {
    try {
      const response = await fetch(`${API_URL}/clients/${userId}`)
      const data = await response.json()
      if (response.ok) {
        setClients(data)
      }
    } catch (error) {
    }
  }

  const loadProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/inventory/${userId}`)
      const data = await response.json()
      if (response.ok) {
        setProducts(data.filter((product) => product.quantity > 0))
      }
    } catch (error) {
    }
  }

  const showSuccess = (message) => {
    setSuccessMessage(message)
    setShowSuccessModal(true)
  }

  const showError = (message) => {
    setErrorMessage(message)
    setShowErrorModal(true)
  }

  const selectClient = (client) => {
    setSelectedClient(client)
    setShowClientModal(false)
  }

  const addProduct = (product) => {
    const existingProduct = selectedProducts.find((p) => p.productId === product.id)
    if (existingProduct) {
      showError("Este producto ya está agregado a la factura")
      return
    }

    const newProduct = {
      productId: product.id,
      productName: product.name,
      availableQuantity: product.quantity,
      unitPrice: product.price,
      quantity: 1,
    }

    setSelectedProducts([...selectedProducts, newProduct])
    setShowProductModal(false)
  }

  const updateProductQuantity = (productId, newQuantity) => {
    const product = selectedProducts.find((p) => p.productId === productId)
    if (newQuantity > product.availableQuantity) {
      showError(`Cantidad máxima disponible: ${product.availableQuantity}`)
      return
    }

    if (newQuantity <= 0) {
      removeProduct(productId)
      return
    }

    setSelectedProducts(selectedProducts.map((p) => (p.productId === productId ? { ...p, quantity: newQuantity } : p)))
  }

  const removeProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter((p) => p.productId !== productId))
  }

  const calculateTotal = () => {
    return selectedProducts.reduce((total, product) => {
      return total + product.quantity * product.unitPrice
    }, 0)
  }

  const createInvoice = async () => {
    if (!selectedClient) {
      showError("Por favor selecciona un cliente")
      return
    }

    if (selectedProducts.length === 0) {
      showError("Por favor agrega al menos un producto")
      return
    }

    setLoading(true)

    try {
      const invoiceData = {
        clientId: selectedClient.id,
        items: selectedProducts.map((p) => ({
          productId: p.productId,
          quantity: p.quantity,
        })),
      }

      const response = await fetch(`${API_URL}/invoices/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      })

      const data = await response.json()

      if (response.ok) {
        showSuccess(
          `¡Factura ${data.invoice.invoiceNumber} creada exitosamente! El inventario se ha actualizado automáticamente.`,
        )
      } else {
        showError(data.error || "Error al crear la factura")
      }
    } catch (error) {
      showError("No se pudo conectar al servidor")
    } finally {
      setLoading(false)
    }
  }

  const handleSuccessOk = () => {
    setShowSuccessModal(false)
    setSelectedClient(null)
    setSelectedProducts([])
    loadProducts()
    router.replace("/invoices")
  }

  const renderClientItem = ({ item }) => (
    <TouchableOpacity className="p-4 border-b border-gray-200" onPress={() => selectClient(item)}>
      <Text className="text-lg font-semibold">{item.name}</Text>
      <Text className="text-gray-600">📞 {item.phone}</Text>
      {item.email && <Text className="text-gray-600">📧 {item.email}</Text>}
    </TouchableOpacity>
  )

  const renderProductItem = ({ item }) => (
    <TouchableOpacity className="p-4 border-b border-gray-200" onPress={() => addProduct(item)}>
      <Text className="text-lg font-semibold">{item.name}</Text>
      <Text className="text-gray-600">Stock: {item.quantity}</Text>
      <Text className="text-gray-600">Precio: ${item.price}</Text>
    </TouchableOpacity>
  )

  const renderSelectedProduct = ({ item }) => (
    <View className="bg-white p-4 mb-2 rounded-lg border border-gray-200">
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-semibold flex-1">{item.productName}</Text>
        <TouchableOpacity onPress={() => removeProduct(item.productId)}>
          <Text className="text-red-500 text-lg">✕</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-gray-600">Precio unitario: ${item.unitPrice}</Text>
      <Text className="text-gray-600">Disponible: {item.availableQuantity}</Text>

      <View className="flex-row items-center mt-2">
        <Text className="text-gray-700 mr-2">Cantidad:</Text>
        <TouchableOpacity
          className="bg-gray-300 w-8 h-8 rounded items-center justify-center"
          onPress={() => updateProductQuantity(item.productId, item.quantity - 1)}
        >
          <Text className="text-lg">-</Text>
        </TouchableOpacity>

        <TextInput
          className="mx-2 border border-gray-300 rounded px-3 py-1 w-16 text-center"
          value={item.quantity.toString()}
          onChangeText={(text) => {
            const num = Number.parseInt(text) || 0
            updateProductQuantity(item.productId, num)
          }}
          keyboardType="numeric"
        />

        <TouchableOpacity
          className="bg-gray-300 w-8 h-8 rounded items-center justify-center"
          onPress={() => updateProductQuantity(item.productId, item.quantity + 1)}
        >
          <Text className="text-lg">+</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-right text-lg font-semibold mt-2">
        Total: ${(item.quantity * item.unitPrice).toFixed(2)}
      </Text>
    </View>
  )

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-green-500 pt-12 pb-4 px-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Text className="text-white text-lg">← Volver</Text>
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Crear Factura</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        <View className="bg-white p-4 rounded-lg mb-4">
          <Text className="text-lg font-semibold mb-2">Cliente</Text>
          <TouchableOpacity className="border border-gray-300 rounded-lg p-3" onPress={() => setShowClientModal(true)}>
            {selectedClient ? (
              <View>
                <Text className="text-lg font-semibold">{selectedClient.name}</Text>
                <Text className="text-gray-600">📞 {selectedClient.phone}</Text>
              </View>
            ) : (
              <Text className="text-gray-500">Seleccionar cliente</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="bg-white p-4 rounded-lg mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-semibold">Productos ({selectedProducts.length})</Text>
            <TouchableOpacity className="bg-blue-500 px-4 py-2 rounded" onPress={() => setShowProductModal(true)}>
              <Text className="text-white">+ Agregar</Text>
            </TouchableOpacity>
          </View>

          {selectedProducts.length === 0 ? (
            <Text className="text-gray-500 text-center py-4">No hay productos agregados</Text>
          ) : (
            <FlatList
              data={selectedProducts}
              renderItem={renderSelectedProduct}
              keyExtractor={(item) => item.productId}
              scrollEnabled={false}
            />
          )}
        </View>

        {selectedProducts.length > 0 && (
          <View className="bg-white p-4 rounded-lg mb-4">
            <Text className="text-2xl font-bold text-right">Total: ${calculateTotal().toFixed(2)}</Text>
          </View>
        )}

        <TouchableOpacity
          className={`bg-green-500 rounded-lg py-4 mb-6 ${loading ? "opacity-50" : ""}`}
          onPress={createInvoice}
          disabled={loading}
        >
          <Text className="text-white text-center text-lg font-semibold">
            {loading ? "Creando Factura..." : "Crear Factura"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showClientModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowClientModal(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50">
          <View className="flex-1 bg-white mt-20 rounded-t-lg">
            <View className="p-4 border-b border-gray-200">
              <View className="flex-row justify-between items-center">
                <Text className="text-xl font-bold">Seleccionar Cliente</Text>
                <TouchableOpacity onPress={() => setShowClientModal(false)}>
                  <Text className="text-blue-500 text-lg">Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>

            {clients.length === 0 ? (
              <View className="flex-1 justify-center items-center">
                <Text className="text-gray-500 mb-4">No tienes clientes registrados</Text>
                <TouchableOpacity
                  className="bg-purple-500 px-6 py-3 rounded-lg"
                  onPress={() => {
                    setShowClientModal(false)
                    router.push("/add-client")
                  }}
                >
                  <Text className="text-white font-semibold">Agregar Cliente</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList data={clients} renderItem={renderClientItem} keyExtractor={(item) => item.id} />
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showProductModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProductModal(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50">
          <View className="flex-1 bg-white mt-20 rounded-t-lg">
            <View className="p-4 border-b border-gray-200">
              <View className="flex-row justify-between items-center">
                <Text className="text-xl font-bold">Seleccionar Producto</Text>
                <TouchableOpacity onPress={() => setShowProductModal(false)}>
                  <Text className="text-blue-500 text-lg">Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>

            {products.length === 0 ? (
              <View className="flex-1 justify-center items-center">
                <Text className="text-gray-500 mb-4">No tienes productos con stock disponible</Text>
                <TouchableOpacity
                  className="bg-blue-500 px-6 py-3 rounded-lg"
                  onPress={() => {
                    setShowProductModal(false)
                    router.push("/add-product")
                  }}
                >
                  <Text className="text-white font-semibold">Agregar Producto</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList data={products} renderItem={renderProductItem} keyExtractor={(item) => item.id} />
            )}
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
            <TouchableOpacity className="bg-green-500 rounded-lg py-3" onPress={handleSuccessOk}>
              <Text className="text-white text-center font-semibold">Ver Facturas</Text>
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
