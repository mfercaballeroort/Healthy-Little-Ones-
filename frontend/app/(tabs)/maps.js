import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import { apiFetch } from '@/services/api';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

// Especialidades disponibles para filtrar (de momento hardcodeadas; en el futuro vendrán del backend o se calcularán según el hijo)
const AVAILABLE_SPECIALTIES = [
  { key: 'sin_gluten', label: 'Sin gluten' },
  { key: 'sin_lactosa', label: 'Sin lactosa' },
  { key: 'vegano', label: 'Vegano' },
  { key: 'vegetariano', label: 'Vegetariano' },
  { key: 'organico', label: 'Orgánico' },
  { key: 'celiacos', label: 'Celíacos' },
];

export default function MapScreen() {
  const [location, setLocation] = useState(null);          // { latitude, longitude }
  const [stores, setStores] = useState([]);                // tiendas obtenidas del backend
  const [selectedFilters, setSelectedFilters] = useState([]); // ej: ['sin_gluten']
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  /**
   * 1. Pide permiso de ubicación al usuario.
   * 2. Si lo concede, obtiene las coordenadas actuales.
   * 3. Si no, guarda un mensaje de error.
   */
  const requestLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Necesitamos permiso de ubicación para mostrar tiendas cercanas.');
      setLoading(false);
      return null;
    }

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const coords = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };
    setLocation(coords);
    return coords;
  };

  /**
   * Llama al backend pasándole lat, lng y las especialidades seleccionadas.
   */
  const fetchStores = async (coords, filters) => {
    if (!coords) return;
    try {
      const params = new URLSearchParams({
        lat: coords.latitude.toString(),
        lng: coords.longitude.toString(),
        maxDistance: '15000', // 15 km
      });
      if (filters.length > 0) {
        params.append('specialties', filters.join(','));
      }
      const res = await apiFetch(`/api/stores/nearby?${params.toString()}`);
      setStores(res.data || []);
    } catch (e) {
      console.error('Error cargando tiendas:', e);
      setErrorMsg('No se pudieron cargar las tiendas.');
    }
  };

  // Al entrar a la pantalla: pide permiso, obtiene ubicación, trae tiendas
  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        setLoading(true);
        setErrorMsg(null);
        const coords = await requestLocation();
        if (coords) {
          await fetchStores(coords, selectedFilters);
        }
        setLoading(false);
      };
      init();
    }, [])
  );

  // Cuando cambian los filtros, refetch
  useEffect(() => {
    if (location) {
      fetchStores(location, selectedFilters);
    }
  }, [selectedFilters]);

  const toggleFilter = (key) => {
    setSelectedFilters(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const openInMaps = (store) => {
    const [lng, lat] = store.location.coordinates;
    const label = encodeURIComponent(store.name);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${label})`,
    });
    Linking.openURL(url).catch(() =>
      Alert.alert('Error', 'No se pudo abrir la app de mapas.')
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Buscando tu ubicación...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{errorMsg}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => requestLocation()}>
          <Text style={styles.retryBtnText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!location) return null;

  return (
    <View style={styles.container}>
      {/* Chips de filtro arriba */}
      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {AVAILABLE_SPECIALTIES.map(s => {
            const active = selectedFilters.includes(s.key);
            return (
              <TouchableOpacity
                key={s.key}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => toggleFilter(s.key)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* El mapa */}
      <MapView
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,   // zoom: más chico = más zoom
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
      >
        {stores.map(store => (
          <Marker
            key={store._id}
            coordinate={{
              latitude: store.location.coordinates[1],   // recordá: GeoJSON es [lng, lat]
              longitude: store.location.coordinates[0],
            }}
            pinColor={Colors.light.primary}
          >
            <Callout onPress={() => openInMaps(store)}>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{store.name}</Text>
                <Text style={styles.calloutAddress}>{store.address}</Text>
                {store.specialties?.length > 0 && (
                  <Text style={styles.calloutSpecs}>
                    {store.specialties.join(' · ')}
                  </Text>
                )}
                <Text style={styles.calloutLink}>📍 Cómo llegar</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Contador abajo */}
      <View style={styles.counter}>
        <Text style={styles.counterText}>
          {stores.length} {stores.length === 1 ? 'tienda encontrada' : 'tiendas encontradas'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.backgroundPrimary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  loadingText: { marginTop: Spacing.md, color: Colors.light.textSecondary, fontSize: 13 },
  errorText: { color: Colors.light.textPrimary, fontSize: 14, textAlign: 'center', marginBottom: Spacing.md },
  retryBtn: { backgroundColor: Colors.light.primary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md },
  retryBtnText: { color: Colors.light.white, fontWeight: '600' },

  filterBar: {
    backgroundColor: Colors.light.white,
    borderBottomWidth: 1,
    borderBottomColor: '#B5D4F4',
    paddingVertical: Spacing.sm,
  },
  filterContent: { paddingHorizontal: Spacing.md, gap: Spacing.sm },
  chip: {
    backgroundColor: Colors.light.backgroundPrimary,
    borderWidth: 1,
    borderColor: '#B5D4F4',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: Spacing.sm,
  },
  chipActive: { backgroundColor: Colors.light.primary, borderColor: Colors.light.primary },
  chipText: { fontSize: 12, color: Colors.light.textPrimary },
  chipTextActive: { color: Colors.light.white, fontWeight: '600' },

  map: { flex: 1 },

  callout: { width: 200, padding: 4 },
  calloutTitle: { fontWeight: '700', fontSize: 13, marginBottom: 4 },
  calloutAddress: { fontSize: 11, color: Colors.light.textSecondary, marginBottom: 4 },
  calloutSpecs: { fontSize: 10, color: Colors.light.primary, marginBottom: 4, fontStyle: 'italic' },
  calloutLink: { fontSize: 11, color: Colors.light.primary, fontWeight: '600' },

  counter: {
    position: 'absolute',
    bottom: Spacing.md,
    alignSelf: 'center',
    backgroundColor: Colors.light.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#B5D4F4',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  counterText: { fontSize: 12, fontWeight: '600', color: Colors.light.textPrimary },
});
