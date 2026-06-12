// frontend/app/(professional)/_layout.js
import { Tabs } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function ProfessionalTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.light.white,
          borderTopColor: '#D4EDE1',
          borderTopWidth: 1,
        },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="patients" options={{ title: 'Pacientes' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}