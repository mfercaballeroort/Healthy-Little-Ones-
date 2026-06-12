import { Tabs } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.light.white,
          borderTopColor: '#B5D4F4',
          borderTopWidth: 1,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Inicio' }}
      />
      <Tabs.Screen
        name="patients"
        options={{ title: 'Pacientes' }}
      />
      <Tabs.Screen
        name="map"
        options={{ title: 'Mapa' }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Perfil' }}
      />
    </Tabs>
  );
}