import { Stack } from "expo-router"
import { AuthProvider } from "../hooks/useAuth"
import "../global.css"

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="inventory" />
        <Stack.Screen name="add-product" />
        <Stack.Screen name="edit-product" />
        <Stack.Screen name="edit-client" />
        <Stack.Screen name="invoice-detail" />
        <Stack.Screen name="reports" />
      </Stack>
    </AuthProvider>
  )
}
