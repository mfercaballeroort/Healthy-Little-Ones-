// frontend/components/ProfileContent.js
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { I18nManager } from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

const LANGUAGES = [
  { code: 'es', labelKey: 'settings.spanish', flag: '🇪🇸' },
  { code: 'en', labelKey: 'settings.english', flag: '🇬🇧' },
  { code: 'ar', labelKey: 'settings.arabic',  flag: '🇸🇦' },
];

export default function ProfileContent() {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();

  const changeLanguage = async (newLang) => {
    if (newLang === i18n.language) return;

    const willBeRTL = newLang === 'ar';
    const isRTLNow = I18nManager.isRTL;
    const directionWillChange = willBeRTL !== isRTLNow;

    await i18n.changeLanguage(newLang);

    // Si cambia la dirección (LTR ↔ RTL), avisar que conviene reiniciar la app
    // para que el cambio se aplique a todos los componentes nativos.
    if (directionWillChange && Platform.OS !== 'web') {
      Alert.alert(
        t('common.success'),
        'Para aplicar el cambio de dirección del texto, cerrá y abrí la app.',
        [{ text: t('common.ok') }]
      );
    }
  };

  // Traducir el rol según código
  const roleLabel = (() => {
    if (user?.role === 'padre') return t('auth.rolePadre');
    if (user?.role === 'medico') return t('auth.roleMedico');
    if (user?.role === 'nutricionista') return t('auth.roleNutricionista');
    return user?.role;
  })();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('settings.profile')}</Text>

      <View style={styles.info}>
        <Text style={styles.label}>{t('auth.name')}</Text>
        <Text style={styles.value}>{user?.name}</Text>
        <Text style={styles.label}>{t('auth.email')}</Text>
        <Text style={styles.value}>{user?.email}</Text>
        <Text style={styles.label}>{t('settings.role')}</Text>
        <Text style={styles.value}>{roleLabel}</Text>
      </View>

      {/* Selector de idioma */}
      <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
      <View style={styles.langCard}>
        {LANGUAGES.map((lang) => {
          const isActive = i18n.language === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              style={[styles.langRow, isActive && styles.langRowActive]}
              onPress={() => changeLanguage(lang.code)}
            >
              <Text style={styles.langFlag}>{lang.flag}</Text>
              <Text style={[styles.langLabel, isActive && styles.langLabelActive]}>
                {t(lang.labelKey)}
              </Text>
              {isActive && <Text style={styles.langCheck}>✓</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>{t('settings.logout')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.backgroundPrimary },
  content: { padding: Spacing.xl, paddingBottom: Spacing.xxl },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: Spacing.lg,
    marginTop: Spacing.xxl,
  },
  info: {
    backgroundColor: Colors.light.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  label: { fontSize: 12, color: Colors.light.textSecondary, marginTop: Spacing.sm },
  value: { fontSize: 16, color: Colors.light.textPrimary, fontWeight: '500' },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    letterSpacing: 0.6,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
  },
  langCard: {
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#EBF5FD',
  },
  langRowActive: { backgroundColor: '#EBF5FD' },
  langFlag: { fontSize: 22, marginRight: Spacing.md },
  langLabel: { fontSize: 15, color: Colors.light.textPrimary, flex: 1 },
  langLabelActive: { fontWeight: '700', color: Colors.light.primary },
  langCheck: { fontSize: 18, color: Colors.light.primary, fontWeight: '700' },

  logoutBtn: {
    backgroundColor: Colors.light.error || '#E74C3C',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  logoutText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});