import { useState } from 'react';
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
import { router } from 'expo-router';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { apiFetch } from '@/services/api';

export default function PatientFormScreen() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: '',
    guardian: '',
    observations: '',
  });
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => setForm({ ...form, [field]: value });

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.birthDate || !form.gender) {
      Alert.alert('Faltan datos', 'Nombre, apellido, fecha de nacimiento y sexo son obligatorios.');
      return;
    }

    setLoading(true);
    try {
      await apiFetch('/api/patients', { method: 'POST', body: form });
      Alert.alert('Éxito', 'Paciente creado correctamente.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo crear el paciente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Nombre *</Text>
      <TextInput
        style={styles.input}
        value={form.firstName}
        onChangeText={(v) => updateField('firstName', v)}
        placeholder="Ej. Lucía"
      />

      <Text style={styles.label}>Apellido *</Text>
      <TextInput
        style={styles.input}
        value={form.lastName}
        onChangeText={(v) => updateField('lastName', v)}
        placeholder="Ej. Martínez"
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
        placeholder="Ej. María (madre)"
      />

      <Text style={styles.label}>Observaciones (opcional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={form.observations}
        onChangeText={(v) => updateField('observations', v)}
        placeholder="Alergias, patologías, notas..."
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity
        style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.submitBtnText}>Guardar paciente</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
        <Text style={styles.cancelBtnText}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.backgroundPrimary },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
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
  submitBtn: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: Colors.light.white, fontSize: 15, fontWeight: '600' },
  cancelBtn: { padding: Spacing.md, alignItems: 'center', marginTop: Spacing.sm },
  cancelBtnText: { color: Colors.light.textSecondary, fontSize: 14 },
});