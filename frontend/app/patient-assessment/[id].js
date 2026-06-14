import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { apiFetch } from '@/services/api';

// Labels en castellano para las clasificaciones que vienen del backend
const CLASSIFICATION_LABELS = {
  severo_bajo: 'Severo (bajo)',
  moderado_bajo: 'Moderado (bajo)',
  normal: 'Normal',
  sobrepeso: 'Sobrepeso',
  obesidad: 'Obesidad',
  talla_alta: 'Talla alta',
  talla_muy_alta: 'Talla muy alta',
};

const INDICATOR_LABELS = {
  wfa: 'Peso para edad',
  lhfa: 'Talla para edad',
  bfa: 'IMC para edad',
};

// Color por nivel de riesgo
const riskColor = (risk) => {
  if (risk === 'Alto') return '#A32D2D';
  if (risk === 'Moderado') return '#854F0B';
  return '#185FA5'; // Bajo / normal
};

const riskBg = (risk) => {
  if (risk === 'Alto') return '#FCEBEB';
  if (risk === 'Moderado') return '#FAEEDA';
  return '#EBF5FD';
};

// Formato amigable del percentilo
const formatPercentile = (p) => {
  if (p === null || p === undefined) return '—';
  if (p < 1) return '< P1';
  if (p > 99) return '> P99';
  return `P${p}`;
};

export default function PatientAssessmentScreen() {
  const { id } = useLocalSearchParams();

  const [patient, setPatient] = useState(null);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [loadingPatient, setLoadingPatient] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // Cargar datos del paciente al entrar
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await apiFetch(`/api/patients/${id}`);
        setPatient(res.data);
      } catch (e) {
        Alert.alert('Error', e.message || 'No se pudo cargar el paciente.');
        router.back();
      } finally {
        setLoadingPatient(false);
      }
    };
    fetchPatient();
  }, [id]);

  const handleSubmit = async () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);

    if (isNaN(w) || w <= 0 || w > 200) {
      Alert.alert('Peso inválido', 'Ingresá un peso entre 0 y 200 kg.');
      return;
    }
    if (isNaN(h) || h <= 0 || h > 250) {
      Alert.alert('Altura inválida', 'Ingresá una altura entre 0 y 250 cm.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch(`/api/patients/${id}/assessment`, {
        method: 'POST',
        body: { weight: w, height: h },
      });
      setResult(res);
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo procesar la evaluación.');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setResult(null);
    setWeight('');
    setHeight('');
  };

  if (loadingPatient) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  // ============ VISTA: RESULTADO ============
  if (result) {
    const { whoAssessment, clinicalStatus, treatmentPlan, patient: patientInfo, disclaimer } = result;
    const overallRisk = clinicalStatus.riskLevel;

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={[styles.statusBanner, { backgroundColor: riskBg(overallRisk) }]}>
          <Text style={[styles.statusLabel, { color: riskColor(overallRisk) }]}>
            RIESGO {overallRisk.toUpperCase()}
          </Text>
          <Text style={styles.statusName}>{patientInfo.name}</Text>
          <Text style={styles.statusMeta}>
            {patientInfo.ageInMonths} meses · {whoAssessment.weight} kg · {whoAssessment.height} cm
          </Text>
        </View>

        {/* Si está fuera de rango OMS, mensaje */}
        {!whoAssessment.inRange && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>📋 Edad fuera del rango actual</Text>
            <Text style={styles.infoText}>{whoAssessment.message}</Text>
            <Text style={styles.infoText}>
              Te mostramos una evaluación general. Para una orientación más precisa, te recomendamos consulta pediátrica.
            </Text>
          </View>
        )}

        {/* Indicadores OMS */}
        {whoAssessment.inRange && (
          <>
            <Text style={styles.sectionTitle}>INDICADORES OMS</Text>
            {Object.entries(whoAssessment.indicators).map(([key, ind]) => {
              if (!ind.classification) return null;
              const c = ind.classification;
              return (
                <View key={key} style={styles.indicatorCard}>
                  <View style={styles.indicatorHeader}>
                    <Text style={styles.indicatorTitle}>{INDICATOR_LABELS[key]}</Text>
                    <View style={[styles.miniBadge, { backgroundColor: riskBg(c.risk), borderColor: riskColor(c.risk) }]}>
                      <Text style={[styles.miniBadgeText, { color: riskColor(c.risk) }]}>
                        {CLASSIFICATION_LABELS[c.label] || c.label}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.indicatorRow}>
                    <View style={styles.indicatorMetric}>
                      <Text style={styles.metricLabel}>Z-score</Text>
                      <Text style={styles.metricValue}>{ind.zScore}</Text>
                    </View>
                    <View style={styles.indicatorMetric}>
                      <Text style={styles.metricLabel}>Percentilo</Text>
                      <Text style={styles.metricValue}>{formatPercentile(ind.percentile)}</Text>
                    </View>
                    {key === 'bfa' && ind.bmi && (
                      <View style={styles.indicatorMetric}>
                        <Text style={styles.metricLabel}>IMC</Text>
                        <Text style={styles.metricValue}>{ind.bmi}</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* Plan de tratamiento */}
        <Text style={styles.sectionTitle}>PLAN DE ACCIÓN</Text>
        <View style={styles.planCard}>
          <Text style={styles.planTitle}>Recomendación</Text>
          <Text style={styles.planText}>{treatmentPlan.dietaryGuidelines}</Text>

          <Text style={[styles.planTitle, { marginTop: Spacing.md }]}>Observaciones clínicas</Text>
          <Text style={styles.planText}>{treatmentPlan.observations}</Text>

          <View style={styles.planMeta}>
            <Text style={styles.planMetaText}>
              📅 Seguimiento: {treatmentPlan.monitoringInterval}
            </Text>
            {clinicalStatus.requiresUrgentAction && (
              <Text style={styles.urgentText}>
                ⚠️ Se recomienda consulta médica pronto.
              </Text>
            )}
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>{disclaimer}</Text>
        </View>

        {/* Acciones */}
        <TouchableOpacity style={styles.primaryBtn} onPress={reset}>
          <Text style={styles.primaryBtnText}>Nueva medición</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.back()}>
          <Text style={styles.secondaryBtnText}>Volver al hijo</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ============ VISTA: FORMULARIO ============
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Nueva medición</Text>
      <Text style={styles.subtitle}>
        {patient?.firstName} {patient?.lastName}
      </Text>

      <Text style={styles.label}>Peso (kg) *</Text>
      <TextInput
        style={styles.input}
        value={weight}
        onChangeText={setWeight}
        placeholder="Ej. 12.5"
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Altura (cm) *</Text>
      <TextInput
        style={styles.input}
        value={height}
        onChangeText={setHeight}
        placeholder="Ej. 86"
        keyboardType="decimal-pad"
      />

      <TouchableOpacity
        style={[styles.primaryBtn, submitting && styles.btnDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.primaryBtnText}>Evaluar</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.back()}>
        <Text style={styles.secondaryBtnText}>Cancelar</Text>
      </TouchableOpacity>

      <View style={styles.infoFooter}>
        <Text style={styles.infoFooterText}>
          La evaluación usa los estándares de crecimiento de la Organización Mundial de la Salud (OMS) para niños de 0 a 5 años.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.backgroundPrimary },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light.backgroundPrimary },

  title: { fontSize: 22, fontWeight: '700', color: Colors.light.textPrimary, marginBottom: 4 },
  subtitle: { fontSize: 14, color: Colors.light.textSecondary, marginBottom: Spacing.lg },

  label: { fontSize: 13, fontWeight: '600', color: Colors.light.textPrimary, marginBottom: 4, marginTop: Spacing.md },
  input: {
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#B5D4F4',
    padding: Spacing.sm,
    fontSize: 14,
    color: Colors.light.textPrimary,
  },

  primaryBtn: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: Colors.light.white, fontSize: 15, fontWeight: '600' },
  secondaryBtn: { padding: Spacing.md, alignItems: 'center', marginTop: Spacing.sm },
  secondaryBtnText: { color: Colors.light.textSecondary, fontSize: 14 },

  // ============ RESULTADO ============
  statusBanner: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  statusLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  statusName: { fontSize: 18, fontWeight: '700', color: Colors.light.textPrimary, marginTop: 4 },
  statusMeta: { fontSize: 12, color: Colors.light.textSecondary, marginTop: 2 },

  sectionTitle: { fontSize: 11, fontWeight: '600', color: Colors.light.textSecondary, letterSpacing: 0.6, marginBottom: Spacing.sm, marginTop: Spacing.md },

  indicatorCard: {
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#B5D4F4',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  indicatorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  indicatorTitle: { fontSize: 13, fontWeight: '600', color: Colors.light.textPrimary },
  miniBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, borderWidth: 1 },
  miniBadgeText: { fontSize: 10, fontWeight: '600' },
  indicatorRow: { flexDirection: 'row', gap: Spacing.lg },
  indicatorMetric: { flex: 1 },
  metricLabel: { fontSize: 10, color: Colors.light.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  metricValue: { fontSize: 16, fontWeight: '700', color: Colors.light.textPrimary, marginTop: 2 },

  planCard: {
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#85B7EB',
    padding: Spacing.md,
  },
  planTitle: { fontSize: 12, fontWeight: '700', color: Colors.light.textPrimary, marginBottom: 4 },
  planText: { fontSize: 13, color: Colors.light.textPrimary, lineHeight: 19 },
  planMeta: { marginTop: Spacing.md, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: '#EBF5FD' },
  planMetaText: { fontSize: 11, color: Colors.light.textSecondary },
  urgentText: { fontSize: 12, color: '#A32D2D', fontWeight: '600', marginTop: 4 },

  infoCard: {
    backgroundColor: '#FAEEDA',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#FAC775',
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  infoTitle: { fontSize: 13, fontWeight: '700', color: '#854F0B', marginBottom: 4 },
  infoText: { fontSize: 12, color: '#854F0B', lineHeight: 18, marginBottom: 4 },

  disclaimer: {
    backgroundColor: Colors.light.backgroundPrimary,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: '#B5D4F4',
  },
  disclaimerText: { fontSize: 10, color: Colors.light.textSecondary, fontStyle: 'italic', textAlign: 'center', lineHeight: 14 },

  infoFooter: { marginTop: Spacing.xxl, padding: Spacing.md },
  infoFooterText: { fontSize: 11, color: Colors.light.textSecondary, textAlign: 'center', lineHeight: 16, fontStyle: 'italic' },
});