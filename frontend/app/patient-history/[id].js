import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { apiFetch } from '@/services/api';

const screenWidth = Dimensions.get('window').width;

const CLASSIFICATION_LABELS = {
  severo_bajo: 'Severo (bajo)',
  moderado_bajo: 'Moderado (bajo)',
  normal: 'Normal',
  sobrepeso: 'Sobrepeso',
  obesidad: 'Obesidad',
  talla_alta: 'Talla alta',
  talla_muy_alta: 'Talla muy alta',
};

const riskColor = (risk) => {
  if (risk === 'Alto') return '#A32D2D';
  if (risk === 'Moderado') return '#854F0B';
  return '#185FA5';
};
const riskBg = (risk) => {
  if (risk === 'Alto') return '#FCEBEB';
  if (risk === 'Moderado') return '#FAEEDA';
  return '#EBF5FD';
};

const formatPercentile = (p) => {
  if (p === null || p === undefined) return '—';
  if (p < 1) return '<P1';
  if (p > 99) return '>P99';
  return `P${p}`;
};

const formatDate = (iso) => {
  const d = new Date(iso);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear().toString().slice(-2)}`;
};

export default function PatientHistoryScreen() {
  const { id } = useLocalSearchParams();
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('weight'); // 'weight' | 'height'

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await apiFetch(`/api/patients/${id}/metrics`);
        setHistory(res);
      } catch (e) {
        Alert.alert('Error', e.message || 'No se pudo cargar el historial.');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (!history || !history.data || history.data.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>Sin mediciones</Text>
        <Text style={styles.emptyText}>
          Este paciente todavía no tiene mediciones cargadas.
        </Text>
      </View>
    );
  }

  const { patient, data } = history;

  // Orden cronológico ASCENDENTE para el gráfico (el array viene DESC del backend)
  const chronological = [...data].reverse();
  const chartLabels = chronological.map(m => formatDate(m.date));
  const chartValues = chronological.map(m => chartType === 'weight' ? m.weight : m.height);

  // Datos descriptivos para el header
  const ageNow = data[0].ageMonths;
  const totalMeasurements = data.length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header con datos del paciente */}
      <View style={styles.headerCard}>
        <Text style={styles.patientName}>{patient.firstName} {patient.lastName}</Text>
        <Text style={styles.patientMeta}>
          {patient.gender === 'F' ? 'Femenino' : 'Masculino'} · {ageNow} meses · {totalMeasurements} {totalMeasurements === 1 ? 'medición' : 'mediciones'}
        </Text>
      </View>

      {/* Selector de variable */}
      <View style={styles.tabRow}>
        <View
          style={[styles.tab, chartType === 'weight' && styles.tabActive]}
          onTouchEnd={() => setChartType('weight')}
        >
          <Text style={[styles.tabText, chartType === 'weight' && styles.tabTextActive]}>
            Peso (kg)
          </Text>
        </View>
        <View
          style={[styles.tab, chartType === 'height' && styles.tabActive]}
          onTouchEnd={() => setChartType('height')}
        >
          <Text style={[styles.tabText, chartType === 'height' && styles.tabTextActive]}>
            Talla (cm)
          </Text>
        </View>
      </View>

      {/* Gráfico */}
      {chartValues.length >= 1 && (
        <View style={styles.chartWrapper}>
          <LineChart
            data={{
              labels: chartLabels,
              datasets: [{ data: chartValues }],
            }}
            width={screenWidth - 32}
            height={220}
            yAxisSuffix={chartType === 'weight' ? ' kg' : ' cm'}
            chartConfig={{
              backgroundColor: Colors.light.white,
              backgroundGradientFrom: Colors.light.white,
              backgroundGradientTo: Colors.light.white,
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(24, 95, 165, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(50, 50, 50, ${opacity})`,
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: Colors.light.primary,
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>
      )}

      {/* Tabla de mediciones */}
      <Text style={styles.sectionTitle}>HISTORIAL DE MEDICIONES</Text>
      <View style={styles.tableHeader}>
        <Text style={[styles.th, { flex: 1.2 }]}>Fecha</Text>
        <Text style={[styles.th, { flex: 0.6 }]}>Edad</Text>
        <Text style={[styles.th, { flex: 0.7 }]}>Peso</Text>
        <Text style={[styles.th, { flex: 0.7 }]}>Talla</Text>
        <Text style={[styles.th, { flex: 0.9 }]}>Riesgo</Text>
      </View>

      {data.map(m => {
        const overallRisk = m.who.inRange ? m.who.overallRisk : 'Fuera de rango';
        const wfa = m.who.inRange ? m.who.indicators.wfa : null;
        const lhfa = m.who.inRange ? m.who.indicators.lhfa : null;
        const bfa = m.who.inRange ? m.who.indicators.bfa : null;

        return (
          <View key={m._id} style={styles.row}>
            <View style={styles.rowMain}>
              <Text style={[styles.td, { flex: 1.2 }]}>{formatDate(m.date)}</Text>
              <Text style={[styles.td, { flex: 0.6 }]}>{m.ageMonths}m</Text>
              <Text style={[styles.td, { flex: 0.7 }]}>{m.weight}</Text>
              <Text style={[styles.td, { flex: 0.7 }]}>{m.height}</Text>
              <View style={[styles.riskBadge, { flex: 0.9, backgroundColor: riskBg(overallRisk), borderColor: riskColor(overallRisk) }]}>
                <Text style={[styles.riskText, { color: riskColor(overallRisk) }]}>
                  {overallRisk}
                </Text>
              </View>
            </View>
            {m.who.inRange && (
              <View style={styles.rowDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Peso/Edad</Text>
                  <Text style={styles.detailValue}>
                    Z={wfa.zScore} · {formatPercentile(wfa.percentile)}
                  </Text>
                  <Text style={[styles.detailClass, { color: riskColor(wfa.classification.risk) }]}>
                    {CLASSIFICATION_LABELS[wfa.classification.label]}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Talla/Edad</Text>
                  <Text style={styles.detailValue}>
                    Z={lhfa.zScore} · {formatPercentile(lhfa.percentile)}
                  </Text>
                  <Text style={[styles.detailClass, { color: riskColor(lhfa.classification.risk) }]}>
                    {CLASSIFICATION_LABELS[lhfa.classification.label]}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>IMC/Edad</Text>
                  <Text style={styles.detailValue}>
                    IMC={bfa.bmi} · {formatPercentile(bfa.percentile)}
                  </Text>
                  <Text style={[styles.detailClass, { color: riskColor(bfa.classification.risk) }]}>
                    {CLASSIFICATION_LABELS[bfa.classification.label]}
                  </Text>
                </View>
              </View>
            )}
          </View>
        );
      })}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Z-scores y percentilos calculados según los estándares de crecimiento de la OMS 2006 (método LMS).
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.backgroundPrimary },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg, backgroundColor: Colors.light.backgroundPrimary },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: Colors.light.textPrimary, marginBottom: 8 },
  emptyText: { fontSize: 13, color: Colors.light.textSecondary, textAlign: 'center' },

  headerCard: {
    backgroundColor: Colors.light.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#B5D4F4',
    marginBottom: Spacing.md,
  },
  patientName: { fontSize: 18, fontWeight: '700', color: Colors.light.textPrimary },
  patientMeta: { fontSize: 12, color: Colors.light.textSecondary, marginTop: 2 },

  tabRow: { flexDirection: 'row', marginBottom: Spacing.md, gap: Spacing.sm },
  tab: {
    flex: 1,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#B5D4F4',
    backgroundColor: Colors.light.white,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: Colors.light.primary, borderColor: Colors.light.primary },
  tabText: { fontSize: 13, color: Colors.light.textPrimary },
  tabTextActive: { color: Colors.light.white, fontWeight: '600' },

  chartWrapper: {
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#B5D4F4',
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  chart: { borderRadius: BorderRadius.lg },

  sectionTitle: { fontSize: 11, fontWeight: '600', color: Colors.light.textSecondary, letterSpacing: 0.6, marginBottom: Spacing.sm, marginTop: Spacing.md },

  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.backgroundPrimary,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#B5D4F4',
    marginBottom: 4,
  },
  th: { fontSize: 10, fontWeight: '700', color: Colors.light.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },

  row: {
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#B5D4F4',
    marginBottom: Spacing.sm,
  },
  rowMain: { flexDirection: 'row', alignItems: 'center', padding: Spacing.sm },
  td: { fontSize: 12, color: Colors.light.textPrimary },
  riskBadge: { paddingVertical: 3, paddingHorizontal: 6, borderRadius: 12, borderWidth: 1, alignItems: 'center', marginLeft: 4 },
  riskText: { fontSize: 10, fontWeight: '600' },

  rowDetails: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#EBF5FD',
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  detailItem: { flex: 1 },
  detailLabel: { fontSize: 9, color: Colors.light.textSecondary, textTransform: 'uppercase', letterSpacing: 0.4 },
  detailValue: { fontSize: 11, color: Colors.light.textPrimary, fontWeight: '600', marginTop: 2 },
  detailClass: { fontSize: 10, fontWeight: '600', marginTop: 2 },

  footer: { marginTop: Spacing.lg, padding: Spacing.md },
  footerText: { fontSize: 10, color: Colors.light.textSecondary, fontStyle: 'italic', textAlign: 'center', lineHeight: 14 },
});