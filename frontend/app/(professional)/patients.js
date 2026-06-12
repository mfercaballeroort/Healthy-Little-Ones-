import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

export default function ProfessionalPatientsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pacientes asignados</Text>
      <Text style={styles.subtitle}>Próximamente: lista de pacientes a cargo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: Colors.light.backgroundPrimary, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '600', color: Colors.light.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 14, color: Colors.light.textSecondary },
});