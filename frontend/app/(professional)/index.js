import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/context/AuthContext';

export default function ProfessionalHome() {
  const { user } = useAuth();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hola Dr. {user?.name}</Text>
      <Text>Rol: {user?.role}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 10 },
});