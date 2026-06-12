import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function ProfessionalProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi perfil</Text>
      <View style={styles.info}>
        <Text style={styles.label}>Nombre</Text>
        <Text style={styles.value}>{user?.name}</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email}</Text>
        <Text style={styles.label}>Rol</Text>
        <Text style={styles.value}>{user?.role}</Text>
      </View>
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.xl, backgroundColor: Colors.light.backgroundPrimary },
  title: { fontSize: 26, fontWeight: '700', color: Colors.light.textPrimary, marginBottom: Spacing.lg, marginTop: Spacing.xxl },
  info: { backgroundColor: Colors.light.white, padding: Spacing.lg, borderRadius: BorderRadius.md, marginBottom: Spacing.lg },
  label: { fontSize: 12, color: Colors.light.textSecondary, marginTop: Spacing.sm },
  value: { fontSize: 16, color: Colors.light.textPrimary, fontWeight: '500' },
  logoutBtn: { backgroundColor: Colors.light.error || '#E74C3C', padding: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});