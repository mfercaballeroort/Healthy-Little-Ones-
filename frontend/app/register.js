// frontend/app/register.js
import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

const ROLES = [
  { value: 'padre', label: 'Padre / Madre' },
  { value: 'medico', label: 'Médico' },
  { value: 'nutricionista', label: 'Nutricionista' },
];

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('padre');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const needsInviteCode = role === 'medico' || role === 'nutricionista';

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Completá todos los campos obligatorios.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (needsInviteCode && !inviteCode) {
      setError('El código de invitación es obligatorio para profesionales.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        inviteCode: needsInviteCode ? inviteCode.trim() : undefined,
      });
      // El _layout.js detecta el nuevo user y redirige solo
    } catch (e) {
      setError(e.message || 'No se pudo crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Crear cuenta</Text>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            placeholder="Tu nombre completo"
            placeholderTextColor={Colors.light.textSecondary}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="tu@email.com"
            placeholderTextColor={Colors.light.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor={Colors.light.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Soy</Text>
          <View style={styles.roleSelector}>
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r.value}
                style={[styles.roleOption, role === r.value && styles.roleOptionActive]}
                onPress={() => setRole(r.value)}>
                <Text
                  style={[styles.roleText, role === r.value && styles.roleTextActive]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {needsInviteCode && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Código de invitación</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresá el código provisto"
              placeholderTextColor={Colors.light.textSecondary}
              value={inviteCode}
              onChangeText={setInviteCode}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <Text style={styles.hint}>
              Los profesionales necesitan un código de invitación para registrarse.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Crear cuenta</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkContainer}
          onPress={() => router.replace('/login')}>
          <Text style={styles.link}>¿Ya tenés cuenta? Iniciá sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.backgroundPrimary },
  scroll: { padding: Spacing.xl, paddingTop: Spacing.xxl },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: Spacing.lg,
  },
  errorContainer: {
    backgroundColor: '#FDECEA',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorText: { color: Colors.light.error, fontSize: 13 },
  inputContainer: { marginBottom: Spacing.md },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: 15,
    color: Colors.light.textPrimary,
    borderWidth: 1,
    borderColor: '#D4EDE1',
  },
  hint: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
  roleSelector: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  roleOption: {
    flex: 1,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: '#D4EDE1',
    backgroundColor: Colors.light.white,
    alignItems: 'center',
  },
  roleOptionActive: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary,
  },
  roleText: { fontSize: 13, color: Colors.light.textPrimary },
  roleTextActive: { color: Colors.light.white, fontWeight: '600' },
  button: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: Colors.light.white, fontSize: 16, fontWeight: '600' },
  linkContainer: { alignItems: 'center' },
  link: { color: Colors.light.primary, fontSize: 14, fontWeight: '500' },
});