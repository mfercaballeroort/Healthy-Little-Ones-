import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/services/api';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { router, useFocusEffect } from 'expo-router';
// Helper: calcula edad en años desde una fecha YYYY-MM-DD
const calcAge = (birthDate) => {
  if (!birthDate) return '';
  const birth = new Date(birthDate);
  const diff = Date.now() - birth.getTime();
  const ageYears = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  if (ageYears < 1) {
    const months = Math.floor(diff / (30.44 * 24 * 60 * 60 * 1000));
    return `${months} ${months === 1 ? 'mes' : 'meses'}`;
  }
  return `${ageYears} ${ageYears === 1 ? 'año' : 'años'}`;
};

const getInitials = (first, last) =>
  `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();

export default function ProfessionalHome() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchPatients = async () => {
        setLoading(true);
        try {
          const res = await apiFetch('/api/patients');
          setPatients(res.data || []);
        } catch (e) {
          console.error('Error cargando pacientes:', e);
        } finally {
          setLoading(false);
        }
      };
      fetchPatients();
    }, [])
  );

  const titlePrefix = user?.role === 'medico' ? 'Dr.' : '';
  const roleLabel = user?.role === 'medico' ? 'Médico' : 'Nutricionista';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola {titlePrefix} {user?.name?.split(' ')[0] ?? ''} 👋</Text>
        <Text style={styles.role}>{roleLabel}</Text>
      </View>

      <Text style={styles.sectionTitle}>MIS PACIENTES</Text>

      {loading ? (
        <ActivityIndicator color={Colors.light.primary} style={{ marginVertical: Spacing.lg }} />
      ) : patients.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            Todavía no tenés pacientes asignados.{'\n\n'}
            Cuando un padre te elija como profesional para su hijo, vas a ver al paciente acá.
          </Text>
        </View>
      ) : (
        patients.map(patient => (
  <TouchableOpacity
    key={patient._id}
    style={styles.patientCard}
    activeOpacity={0.7}
    onPress={() => router.push(`/patient-history/${patient._id}`)}
  >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(patient.firstName, patient.lastName)}</Text>
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{patient.firstName} {patient.lastName}</Text>
              <Text style={styles.patientMeta}>
                {calcAge(patient.birthDate)} · {patient.gender === 'F' ? 'Femenino' : 'Masculino'}
              </Text>
              {patient.observations ? (
                <Text style={styles.patientObs} numberOfLines={1}>{patient.observations}</Text>
              ) : null}
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.backgroundPrimary },
  content: { padding: Spacing.md, paddingTop: Spacing.xxl, paddingBottom: Spacing.xxl },
  header: { marginBottom: Spacing.lg },
  greeting: { fontSize: 20, fontWeight: '700', color: Colors.light.textPrimary },
  role: { fontSize: 13, color: Colors.light.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: 11, fontWeight: '600', color: Colors.light.textSecondary, letterSpacing: 0.6, marginBottom: Spacing.sm },
  patientCard: { backgroundColor: Colors.light.white, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: '#B5D4F4', padding: Spacing.md, flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.sm },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.light.backgroundPrimary, borderWidth: 1, borderColor: '#85B7EB', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontWeight: '600', color: Colors.light.textPrimary },
  patientInfo: { flex: 1 },
  patientName: { fontSize: 13, fontWeight: '600', color: Colors.light.textPrimary },
  patientMeta: { fontSize: 11, color: Colors.light.textSecondary, marginTop: 2 },
  patientObs: { fontSize: 11, color: Colors.light.textSecondary, marginTop: 2, fontStyle: 'italic' },
  chevron: { fontSize: 18, color: '#85B7EB' },
  emptyCard: { backgroundColor: Colors.light.white, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: '#B5D4F4', padding: Spacing.lg, alignItems: 'center' },
  emptyText: { fontSize: 13, color: Colors.light.textSecondary, textAlign: 'center', lineHeight: 19 },
});