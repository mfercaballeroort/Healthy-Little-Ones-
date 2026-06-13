import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { apiFetch } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

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

// Helper: iniciales del nombre
const getInitials = (first, last) =>
  `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();

export default function DashboardScreen() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [aiText, setAiText] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  // Cargar pacientes cada vez que se vuelve a esta pantalla
  useFocusEffect(
    useCallback(() => {
      const fetchPatients = async () => {
        setLoadingList(true);
        try {
          const data = await apiFetch('/api/patients');
          setPatients(data.data || []);
        } catch (e) {
          console.error('Error cargando pacientes:', e);
        } finally {
          setLoadingList(false);
        }
      };
      fetchPatients();
    }, [])
  );

  const isParent = user?.role === 'padre';
  const sectionLabel = isParent ? 'MIS HIJOS' : 'MIS PACIENTES';
  const addButtonLabel = isParent ? '＋  Agregar hijo' : '＋  Agregar paciente';

  const analyzeWithAI = async (patient) => {
    setLoadingAI(true);
    setAiText('');
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 300,
          system: 'Sos un asistente de salud infantil. Respondé siempre en español, de forma breve, clara y amigable para padres. No reemplazás al médico.',
          messages: [{
            role: 'user',
            content: `Paciente: ${patient.firstName} ${patient.lastName}, edad ${calcAge(patient.birthDate)}, sexo ${patient.gender}. Dame 2-3 consejos nutricionales generales y breves apropiados para esta edad.`,
          }],
        }),
      });
      const data = await response.json();
      const text = data.content?.[0]?.text ?? 'No se pudo obtener análisis.';
      setAiText(text);
    } catch {
      setAiText('Error al conectar con el servicio de IA.');
    } finally {
      setLoadingAI(false);
    }
  };

  // Para el panel de IA usamos siempre el primer hijo de la lista
  const firstChild = patients[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola {user?.name?.split(' ')[0] ?? ''} 👋</Text>
          <Text style={styles.appName}>GrowSmart AI</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/patient-form')}>
        <Text style={styles.addButtonText}>{addButtonLabel}</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>{sectionLabel}</Text>

      {loadingList ? (
        <ActivityIndicator color={Colors.light.primary} style={{ marginVertical: Spacing.lg }} />
      ) : patients.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            {isParent
              ? 'Todavía no registraste a ningún hijo. Tocá "Agregar hijo" para empezar.'
              : 'No tenés pacientes asignados todavía.'}
          </Text>
        </View>
      ) : (
        patients.map(patient => (
          <TouchableOpacity
            key={patient._id}
            style={styles.patientCard}
            onPress={() =>
              isParent
                ? router.push(`/patient-edit/${patient._id}`)
                : null
            }
            activeOpacity={isParent ? 0.7 : 1}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(patient.firstName, patient.lastName)}</Text>
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{patient.firstName} {patient.lastName}</Text>
              <Text style={styles.patientMeta}>
                {calcAge(patient.birthDate)} · {patient.gender === 'F' ? 'Femenino' : 'Masculino'}
              </Text>
            </View>
            {isParent && <Text style={styles.chevron}>›</Text>}
          </TouchableOpacity>
        ))
      )}

      {/* Panel de IA solo para padres con al menos un hijo */}
      {isParent && firstChild && (
        <View style={styles.aiSection}>
          <Text style={styles.sectionTitle}>ANÁLISIS IA · {firstChild.firstName.toUpperCase()}</Text>
          <View style={styles.aiCard}>
            <View style={styles.aiHeader}>
              <View style={styles.aiIcon}>
                <Text style={styles.aiIconText}>🤖</Text>
              </View>
              <View>
                <Text style={styles.aiTitle}>Consejos nutricionales</Text>
                <Text style={styles.aiSubtitle}>Orientación general por edad</Text>
              </View>
            </View>
            {aiText ? (
              <Text style={styles.aiBody}>{aiText}</Text>
            ) : (
              <Text style={styles.aiPlaceholder}>
                Tocá el botón para obtener consejos personalizados con IA.
              </Text>
            )}
            <TouchableOpacity
              style={[styles.aiButton, loadingAI && styles.aiButtonDisabled]}
              onPress={() => analyzeWithAI(firstChild)}
              disabled={loadingAI}>
              {loadingAI
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.aiButtonText}>Analizar con IA</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.backgroundPrimary },
  content: { padding: Spacing.md, paddingTop: Spacing.xxl, paddingBottom: Spacing.xxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  greeting: { fontSize: 14, color: Colors.light.textSecondary },
  appName: { fontSize: 22, fontWeight: '700', color: Colors.light.textPrimary },
  addButton: { backgroundColor: Colors.light.primary, borderRadius: BorderRadius.md, padding: Spacing.md, alignItems: 'center', marginBottom: Spacing.lg },
  addButtonText: { color: Colors.light.white, fontSize: 15, fontWeight: '600' },
  sectionTitle: { fontSize: 11, fontWeight: '600', color: Colors.light.textSecondary, letterSpacing: 0.6, marginBottom: Spacing.sm },
  patientCard: { backgroundColor: Colors.light.white, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: '#B5D4F4', padding: Spacing.md, flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.sm },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.light.backgroundPrimary, borderWidth: 1, borderColor: '#85B7EB', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontWeight: '600', color: Colors.light.textPrimary },
  patientInfo: { flex: 1 },
  patientName: { fontSize: 13, fontWeight: '600', color: Colors.light.textPrimary },
  patientMeta: { fontSize: 11, color: Colors.light.textSecondary, marginTop: 2 },
  chevron: { fontSize: 18, color: '#85B7EB' },
  emptyCard: { backgroundColor: Colors.light.white, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: '#B5D4F4', padding: Spacing.lg, alignItems: 'center' },
  emptyText: { fontSize: 13, color: Colors.light.textSecondary, textAlign: 'center', lineHeight: 19 },
  aiSection: { marginTop: Spacing.lg },
  aiCard: { backgroundColor: Colors.light.white, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: '#85B7EB', padding: Spacing.md },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  aiIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.light.primary, alignItems: 'center', justifyContent: 'center' },
  aiIconText: { fontSize: 18 },
  aiTitle: { fontSize: 13, fontWeight: '600', color: Colors.light.textPrimary },
  aiSubtitle: { fontSize: 11, color: Colors.light.textSecondary },
  aiPlaceholder: { fontSize: 12, color: Colors.light.textSecondary, marginBottom: Spacing.md, lineHeight: 18 },
  aiBody: { fontSize: 12, color: Colors.light.textPrimary, lineHeight: 19, marginBottom: Spacing.md },
  aiButton: { backgroundColor: Colors.light.primary, borderRadius: BorderRadius.md, padding: Spacing.sm, alignItems: 'center' },
  aiButtonDisabled: { opacity: 0.7 },
  aiButtonText: { color: Colors.light.white, fontSize: 13, fontWeight: '600' },
});