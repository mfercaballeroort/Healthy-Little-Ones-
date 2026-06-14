import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { I18nManager } from 'react-native';

import es from './locales/es.json';
import en from './locales/en.json';
import ar from './locales/ar.json';

// Idiomas que se escriben de derecha a izquierda
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

/**
 * Detecta el idioma del dispositivo.
 * Si el dispositivo está en un idioma que no soportamos, cae al español.
 */
const detectDeviceLanguage = () => {
  try {
    const locales = getLocales();
    if (!locales || locales.length === 0) return 'es';
    const code = locales[0].languageCode?.toLowerCase();
    if (['es', 'en', 'ar'].includes(code)) return code;
    return 'es';
  } catch {
    return 'es';
  }
};

/**
 * Configura el layout RTL (right-to-left) según el idioma activo.
 * IMPORTANTE: I18nManager requiere reinicio de la app para aplicar el cambio
 * de dirección a TODOS los componentes nativos. La primera vez que el usuario
 * cambia a árabe, conviene mostrarle un aviso de "reiniciá la app".
 */
const configureRTL = (lng) => {
  const shouldBeRTL = RTL_LANGUAGES.includes(lng);
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.allowRTL(shouldBeRTL);
    I18nManager.forceRTL(shouldBeRTL);
  }
};

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    lng: detectDeviceLanguage(),
    fallbackLng: 'es',
    resources: {
      es: { translation: es },
      en: { translation: en },
      ar: { translation: ar },
    },
    interpolation: {
      escapeValue: false, // React ya escapa por defecto, no hace falta doble escape
    },
  });

// Aplicar RTL al inicializar
configureRTL(i18n.language);

// Re-aplicar RTL cada vez que el usuario cambia de idioma
i18n.on('languageChanged', (lng) => {
  configureRTL(lng);
});

export default i18n;