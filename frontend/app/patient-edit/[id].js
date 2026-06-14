import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { apiFetch } from '@/services/api';

export default function PatientEditScreen() {
  const { id } = useLocalSearchParams();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: '',
    guardian: '',
    observations: '',
    assignedDoctorId: '',
    assignedNutritionistId: '',
  });
  const [medicos, setMedicos] = useState([]);
  const [nutricionistas, setNutricionistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Cargar paciente + lista de profesionales al montar
  useEffect(() => {
    const loadData = async () => {
      try {
        const [patientRes, profRes] = await Promise.all([
          apiFetch(`/api/patients/${id}`),
          apiFetch('/api/users/professionals'),
        ]);

        const p = patientRes.data;
        setForm({
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          birthDate: p.birthDate ? p.birthDate.split('T')[0] : '',
          gender: p.gender || '',
          guardian: p.guardian || '',
          observations: p.observations || '',
          assignedDoctorId: p.assignedDoctorId || '',
          assignedNutritionistId: p.assignedNutritionistId || '',
        });
        setMedicos(profRes.medicos || []);
        setNutricionistas(profRes.nutricionistas || []);
      } catch (e) {
        Alert.alert('Error', e.message || 'No se pudieron cargar los datos.');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const updateField = (field, value) => setForm({ ...form, [field]: value });

  const handleSave = async () => {
    if (!form.firstName || !form.lastName || !form.birthDate || !form.gender) {
      Alert.alert('Faltan datos', 'Nombre, apellido, fecha de nacimiento y sexo son obligatorios.');
      return;
    }

    setSaving(true);
    try {
      // Convertir "" en null para asignaciones (así MongoDB las borra)
      const body = {
        ...form,
        assignedDoctorId: form.assignedDoctorId || null,
        assignedNutritionistId: form.assignedNutritionistId || null,
      };

      await apiFetch(`/api/patients/${id}`, { method: 'PUT', body });
      Alert.alert('Éxito', 'Cambios guardados.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudieron guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar hijo',
      `¿Estás seguro de eliminar a ${form.firstName} ${form.lastName}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiFetch(`/api/patients/${id}`, { method: 'DELETE' });
              Alert.alert('Eliminado', 'El hijo fue eliminado.', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (e) {
              Alert.alert('Error', e.message || 'No se pudo eliminar.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionLabel}>DATOS DEL HIJO</Text>

      <Text style={styles.label}>Nombre *</Text>
      <TextInput
        style={styles.input}
        value={form.firstName}
        onChangeText={(v) => updateField('firstName', v)}
      />

      <Text style={styles.label}>Apellido *</Text>
      <TextInput
        style={styles.input}
        value={form.lastName}
        onChangeText={(v) => updateField('lastName', v)}
      />

      <Text style={styles.label}>Fecha de nacimiento *</Text>
      <TextInput
        style={styles.input}
        value={form.birthDate}
        onChangeText={(v) => updateField('birthDate', v)}
        placeholder="YYYY-MM-DD"
      />

      <Text style={styles.label}>Sexo *</Text>
      <View style={styles.genderRow}>
        <TouchableOpacity
          style={[styles.genderBtn, form.gender === 'F' && styles.genderBtnActive]}
          onPress={() => updateField('gender', 'F')}>
          <Text style={[styles.genderText, form.gender === 'F' && styles.genderTextActive]}>
            Femenino
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.genderBtn, form.gender === 'M' && styles.genderBtnActive]}
          onPress={() => updateField('gender', 'M')}>
          <Text style={[styles.genderText, form.gender === 'M' && styles.genderTextActive]}>
            Masculino
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Tutor (opcional)</Text>
      <TextInput
        style={styles.input}
        value={form.guardian}
        onChangeText={(v) => updateField('guardian', v)}
      />

      <Text style={styles.label}>Observaciones (opcional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={form.observations}
        onChangeText={(v) => updateField('observations', v)}
        multiline
        numberOfLines={4}
      />

      <Text style={[styles.sectionLabel, { marginTop: Spacing.lg }]}>PROFESIONALES ASIGNADOS</Text>

      <Text style={styles.label}>Médico</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={form.assignedDoctorId}
          onValueChange={(v) => updateField('assignedDoctorId', v)}
        >
          <Picker.Item label="— Sin asignar —" value="" />
          {medicos.map(m => (
            <Picker.Item key={m._id} label={`Dr. ${m.name}`} value={m._id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Nutricionista</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={form.assignedNutritionistId}
          onValueChange={(v) => updateField('assignedNutritionistId', v)}
        >
          <Picker.Item label="— Sin asignar —" value="" />
          {nutricionistas.map(n => (
            <Picker.Item key={n._id} label={n.name} value={n._id} />
          ))}
        </Picker>
      </View>
      {/* Botón de evaluación nutricional */}
      <TouchableOpacity
        style={styles.assessmentBtn}
        onPress={() => router.push(`/patient-assessment/${id}`)}
      >
        <Text style={styles.assessmentBtnText}>📊  Nueva medición / Evaluación</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.btnDisabled]}
        onPress={handleSave}
        disabled={saving}>
        {saving
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.saveBtnText}>Guardar cambios</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
        <Text style={styles.cancelBtnText}>Cancelar</Text>
      </TouchableOpacity>

      <View style={styles.dangerZone}>
        <Text style={styles.dangerLabel}>ZONA PELIGROSA</Text>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>Eliminar hijo</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.backgroundPrimary },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light.backgroundPrimary },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: Colors.light.textSecondary, letterSpacing: 0.6, marginBottom: Spacing.sm },
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
  textArea: { height: 90, textAlignVertical: 'top' },
  genderRow: { flexDirection: 'row', gap: Spacing.sm },
  genderBtn: {
    flex: 1,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#B5D4F4',
    backgroundColor: Colors.light.white,
    alignItems: 'center',
  },
  genderBtnActive: { backgroundColor: Colors.light.primary, borderColor: Colors.light.primary },
  genderText: { fontSize: 13, color: Colors.light.textPrimary },
  genderTextActive: { color: Colors.light.white, fontWeight: '600' },
  pickerWrapper: {
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#B5D4F4',
    overflow: 'hidden',
  },
  saveBtn: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  btnDisabled: { opacity: 0.6 },
  saveBtnText: { color: Colors.light.white, fontSize: 15, fontWeight: '600' },
  cancelBtn: { padding: Spacing.md, alignItems: 'center', marginTop: Spacing.sm },
  cancelBtnText: { color: Colors.light.textSecondary, fontSize: 14 },
  dangerZone: {
    marginTop: Spacing.xxl,
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F09595',
  },
  dangerLabel: { fontSize: 11, fontWeight: '600', color: '#A32D2D', letterSpacing: 0.6, marginBottom: Spacing.sm },
  deleteBtn: {
    backgroundColor: Colors.light.white,
    borderWidth: 1,
    borderColor: '#F09595',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  deleteBtnText: { color: '#A32D2D', fontSize: 14, fontWeight: '600' },
  assessmentBtn: {
    backgroundColor: Colors.light.white,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  assessmentBtnText: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});