import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

const MOCK_PATIENTS = [
  { id: '1', name: 'Lucía Martínez', age: '3 años', weight: '13.2 kg', height: '94 cm', state: 'normal', initials: 'LM' },
  { id: '2', name: 'Tomás Sánchez',  age: '5 años', weight: '17.8 kg', height: '105 cm', state: 'riesgo', initials: 'TS' },
  { id: '3', name: 'Valentina Ruiz', age: '1 año',  weight: '9.1 kg',  height: '74 cm',  state: 'alerta', initials: 'VR' },
];

const STATE_LABELS = { normal: 'Normal', riesgo: 'Riesgo', alerta: 'Alerta' };

export default function DashboardScreen() {
  const [selected, setSelected] = useState(MOCK_PATIENTS[0]);
  const [aiText, setAiText] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  const getStateStyle = (state) => {
    switch (state) {
      case 'normal': return styles.badgeNormal;
      case 'riesgo': return styles.badgeRiesgo;
      case 'alerta': return styles.badgeAlerta;
    }
  };

  const getStateTextStyle = (state) => {
    switch (state) {
      case 'normal': return styles.badgeTextNormal;
      case 'riesgo': return styles.badgeTextRiesgo;
      case 'alerta': return styles.badgeTextAlerta;
    }
  };

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
            content: `Paciente: ${patient.name}, ${patient.age}, peso ${patient.weight}, talla ${patient.height}, estado nutricional: ${patient.state}. Dame 2-3 consejos nutricionales concretos y breves.`,
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

  const handleSelectPatient = (patient) => {
    setSelected(patient);
    setAiText('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola 👋</Text>
          <Text style={styles.appName}>GrowSmart AI</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/patient-form')}>
        <Text style={styles.addButtonText}>＋  Agregar paciente</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>MIS PACIENTES</Text>

      {MOCK_PATIENTS.map(patient => (
        <TouchableOpacity
          key={patient.id}
          style={[styles.patientCard, selected.id === patient.id && styles.patientCardSelected]}
          onPress={() => handleSelectPatient(patient)}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{patient.initials}</Text>
          </View>
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{patient.name}</Text>
            <Text style={styles.patientMeta}>{patient.age} · {patient.weight} · {patient.height}</Text>
          </View>
          <View style={[styles.badge, getStateStyle(patient.state)]}>
            <Text style={[styles.badgeText, getStateTextStyle(patient.state)]}>
              {STATE_LABELS[patient.state]}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      ))}

      <View style={styles.aiSection}>
        <Text style={styles.sectionTitle}>ANÁLISIS IA · {selected.name.split(' ')[0].toUpperCase()}</Text>
        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <View style={styles.aiIcon}>
              <Text style={styles.aiIconText}>🤖</Text>
            </View>
            <View>
              <Text style={styles.aiTitle}>Estado nutricional</Text>
              <Text style={styles.aiSubtitle}>Basado en los datos cargados</Text>
            </View>
          </View>
          {aiText ? (
            <Text style={styles.aiBody}>{aiText}</Text>
          ) : (
            <Text style={styles.aiPlaceholder}>
              Tocá el botón para obtener un análisis personalizado con IA.
            </Text>
          )}
          <TouchableOpacity
            style={[styles.aiButton, loadingAI && styles.aiButtonDisabled]}
            onPress={() => analyzeWithAI(selected)}
            disabled={loadingAI}>
            {loadingAI
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.aiButtonText}>Analizar con IA</Text>
            }
          </TouchableOpacity>
        </View>
      </View>

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
  patientCardSelected: { borderColor: Colors.light.primary, borderWidth: 2 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.light.backgroundPrimary, borderWidth: 1, borderColor: '#85B7EB', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontWeight: '600', color: Colors.light.textPrimary },
  patientInfo: { flex: 1 },
  patientName: { fontSize: 13, fontWeight: '600', color: Colors.light.textPrimary },
  patientMeta: { fontSize: 11, color: Colors.light.textSecondary, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: '600' },
  badgeNormal: { backgroundColor: '#EBF5FD', borderColor: '#85B7EB' },
  badgeRiesgo: { backgroundColor: '#FAEEDA', borderColor: '#FAC775' },
  badgeAlerta: { backgroundColor: '#FCEBEB', borderColor: '#F09595' },
  badgeTextNormal: { color: '#185FA5' },
  badgeTextRiesgo: { color: '#854F0B' },
  badgeTextAlerta: { color: '#A32D2D' },
  chevron: { fontSize: 18, color: '#85B7EB' },
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