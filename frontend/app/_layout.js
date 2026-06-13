// frontend/app/_layout.js
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/theme';

/**
 * Componente interno que reacciona a cambios en el estado de auth
 * y redirige al grupo de rutas correcto.
 */
function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // esperar a que se valide el token guardado

    const currentGroup = segments[0]; // '(tabs)', '(professional)', 'login', etc.
    const isInAuthScreen = currentGroup === 'login' || currentGroup === 'register';

    if (!user && !isInAuthScreen) {
      // No logueado e intentando entrar a rutas privadas → al login
      router.replace('/login');
    } else if (user && isInAuthScreen) {
      // Logueado pero todavía en login/register → redirigir según rol
      if (user.role === 'padre') {
        router.replace('/(tabs)');
      } else {
        router.replace('/(professional)');
      }
    } else if (user) {
      // Logueado y dentro de la app: verificar que esté en el grupo correcto
      const isParent = user.role === 'padre';
      if (isParent && currentGroup === '(professional)') {
        router.replace('/(tabs)');
      } else if (!isParent && currentGroup === '(tabs)') {
        router.replace('/(professional)');
      }
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
  <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="login" />
    <Stack.Screen name="register" />
    <Stack.Screen name="(tabs)" />
    <Stack.Screen name="(professional)" />
    <Stack.Screen
      name="patient-form"
      options={{
        headerShown: true,
        title: 'Cargar paciente',
        headerBackTitle: 'Atrás',
      }}
    />
      <Stack.Screen

  name="patient-edit/[id]"
  options={{
    headerShown: true,
    title: 'Editar hijo',
    headerBackTitle: 'Atrás',
  }}
/>
  </Stack>
);
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundPrimary,
  },
});