# 🌱 GrowSmart AI — Healthy Little Ones

Aplicación móvil de cribado nutricional pediátrico que combina los estándares oficiales de la **Organización Mundial de la Salud (OMS)** con orientación basada en inteligencia artificial, para acompañar a familias en el seguimiento del crecimiento de niñas y niños.

> **Disclaimer**: GrowSmart AI es una herramienta de cribado y orientación. No reemplaza la consulta con un profesional de la salud.

---

## 🎯 ¿Qué resuelve?

Los padres suelen tener dudas sobre el crecimiento de sus hijos pero no siempre acceden rápidamente a una consulta profesional. GrowSmart AI permite:

- Cargar mediciones de peso y talla y obtener una **evaluación nutricional inmediata** basada en los estándares OMS (Z-scores y percentilos).
- Recibir **orientación clínica adaptada a la edad** del niño.
- Encontrar **tiendas cercanas con alimentos específicos** (sin gluten, sin lactosa, etc.) según las necesidades del hijo.
- Conectar al padre con **profesionales asignados** (médicos / nutricionistas) que pueden hacer seguimiento longitudinal.

---

## 🏗️ Stack tecnológico

### Backend
- **Node.js** + **Express** (ES Modules)
- **MongoDB Atlas** con **Mongoose** (ODM)
- **JWT** + **bcrypt** para autenticación
- **GeoJSON + índices 2dsphere** para búsquedas geoespaciales

### Frontend
- **React Native** + **Expo SDK 54**
- **Expo Router** (file-based routing)
- **expo-location** (API del dispositivo: geolocalización)
- **expo-secure-store** (almacenamiento seguro de tokens)
- **react-native-maps** (mapas nativos)
- **react-native-chart-kit** + **react-native-svg** (gráficos)

### APIs externas
- **Claude API** (Anthropic) — orientación nutricional con IA
- **Estándares OMS Child Growth Standards 2006** — tablas LMS oficiales

### Organización del proyecto
- **NPM Workspaces** (monorepo backend + frontend)
- **Concurrently** para correr ambos servicios en paralelo

---

## 🚀 Cómo correr el proyecto

### Requisitos previos
- Node.js 18+ y npm
- Acceso a un cluster MongoDB Atlas (o instancia local)
- Para mobile: **Expo Go** instalado en el celular
- Para web: navegador moderno

### Instalación

```bash
git clone https://github.com/<usuario>/Healthy-Little-Ones-.git
cd Healthy-Little-Ones-
npm install
```

### Variables de entorno

Crear `backend/.env` con:

```env
MONGO_URI=mongodb+srv://...        # cluster MongoDB Atlas
JWT_SECRET=...                      # cadena aleatoria larga (48 bytes hex)
JWT_EXPIRES_IN=7d
INVITE_CODE_MEDICO=GROWSMART_MED_2026
INVITE_CODE_NUTRICIONISTA=GROWSMART_NUT_2026
PORT=5000
```

### Arranque

Desde la raíz del monorepo, levanta ambos servicios en paralelo:

```bash
npm run dev
```

- Backend: `http://localhost:5000`
- Frontend (Metro Bundler): `http://localhost:8081`

Para correr individualmente:

```bash
npm run dev:backend
npm run dev:frontend
```

### Datos iniciales (opcional)

Para poblar las tiendas de Buenos Aires:

```bash
cd backend
node src/seeds/seedStores.js
```

---

## 🏛️ Arquitectura

El proyecto sigue una arquitectura **por capas** con **separación estricta de responsabilidades**.

### Backend

```
backend/src/
├── routes/         # Mapeo URL ↔ controller
├── controllers/    # Lógica HTTP (request/response)
├── services/       # Lógica de dominio y patrones de diseño
│   ├── NutritionFacade.js              # Facade + Singleton
│   ├── interfaces/                     # NutritionState, NutritionStrategy, NutritionObserver
│   ├── states/                         # NormalState, RiskState, AlertState
│   ├── strategies/                     # HealthyEating, GrowthMonitoring, LowWeight
│   │   └── shared/                     # Tablas de consejos por rango etario
│   ├── observers/                      # Historial, Alert, Contenido
│   └── whoStandards/                   # WhoGrowthService + tablas LMS OMS
├── data/           # Repository Pattern (única capa que toca Mongo)
│   └── models/     # Schemas y modelos Mongoose
└── middleware/     # authMiddleware, requireRole, validate*
```

### Frontend

```
frontend/app/
├── (tabs)/                       # Tabs del PADRE (Inicio / Mapa / Perfil)
├── (professional)/               # Tabs del PROFESIONAL (Inicio / Pacientes / Perfil)
├── patient-form.js               # Crear hijo
├── patient-edit/[id].js          # Editar hijo + asignar profesionales
├── patient-assessment/[id].js    # Evaluación nutricional con OMS
├── patient-history/[id].js       # Historial longitudinal (solo profesionales)
├── login.js / register.js        # Auth
└── _layout.js                    # Root layout: ruteo condicional por rol
```

---

## 🧠 Patrones de diseño aplicados

El subsistema de evaluación nutricional implementa **cinco patrones de diseño** trabajando en conjunto:

| Patrón | Dónde | Función |
|---|---|---|
| **Singleton** | `NutritionFacade`, `WhoGrowthService` | Una sola instancia por proceso, compartida vía ES Module cache. |
| **Facade** | `NutritionFacade.executeAssessment()` | Interfaz única que orquesta cálculo OMS + State + Strategy + Observers. El cliente HTTP solo llama un método. |
| **State** | `NormalState`, `RiskState`, `AlertState` | El estado clínico del paciente determina su comportamiento. Cada State expone `getRiskLevel()`, `getBaseMessage()`, `requiresMedicalAttention()`. |
| **Strategy** | `HealthyEatingStrategy`, `GrowthMonitoringStrategy`, `LowWeightStrategy` | Algoritmos intercambiables de recomendación clínica, seleccionados según el State. |
| **Observer** | `HistorialObserver`, `AlertObserver`, `ContenidoObserver` | Suscriptores que reaccionan a cada evaluación completada. |

### Flujo de una evaluación

```
POST /api/patients/:id/assessment { weight, height }
        ↓
patientController.createAssessment()
        ↓
nutritionFacade.executeAssessment()
        ↓
1. Cargar paciente desde DB
2. Persistir métrica
3. whoGrowthService.calculate() → Z-scores y percentilos OMS
4. _resolveClinicalState() → State (Normal / Risk / Alert)
5. _resolveStrategy(state) → Strategy correspondiente
6. strategy.generateAdvice(child, metric, state) → recomendación adaptada por edad
7. _notify('assessment:completed') → Observers reaccionan
        ↓
Response con clinicalStatus + treatmentPlan + whoAssessment
```

---

## 🩺 Método clínico: estándares OMS

La evaluación nutricional usa los **WHO Child Growth Standards 2006** mediante el **método LMS de Cole-Green**:

- **L (lambda)** — skewness de la distribución
- **M (mu)** — mediana esperada
- **S (sigma)** — coeficiente de variación

```
Z = ((medición / M)^L - 1) / (L * S)    si L ≠ 0
Z = ln(medición / M) / S                si L = 0
```

A partir del Z-score se calcula el percentilo aproximando la CDF de la distribución normal (Abramowitz & Stegun).

### Indicadores implementados (0-60 meses)

- **WFA** (Weight-for-Age) — peso para edad
- **LHFA** (Length/Height-for-Age) — talla para edad
- **BFA** (BMI-for-Age) — IMC para edad

Los puntos de corte por Z-score siguen las recomendaciones OMS:

| Z-score | Clasificación |
|---|---|
| Z < -3 | Severo (riesgo alto) |
| -3 ≤ Z < -2 | Moderado (riesgo moderado) |
| -2 ≤ Z ≤ +2 | Normal |
| +2 < Z ≤ +3 | Sobrepeso / talla alta |
| Z > +3 | Obesidad / talla muy alta |

### Consejos clínicos por rango etario

Los consejos están separados de la lógica de las Strategies usando **tablas de lookup** indexadas por seis rangos pediátricos:

- Lactante exclusivo (0-6 meses)
- Lactante con alimentación complementaria (6-12 meses)
- Niño pequeño (1-2 años)
- Preescolar (2-5 años)
- Escolar (5-12 años)
- Adolescente (12+ años)

Esto implementa el **principio Open/Closed** (SOLID): agregar nuevos consejos o rangos no requiere modificar la lógica.

---

## 🔐 Autenticación y autorización

- **JWT** firmado con secret, expiración configurable.
- **bcrypt** para hashing de contraseñas.
- **Tres roles**: `padre`, `medico`, `nutricionista`.
- **Códigos de invitación** obligatorios para registrarse como profesional (médico y nutricionista usan códigos distintos, configurables vía `.env`).
- **Autorización fina por recurso**:
  - Padres ven solo sus hijos.
  - Profesionales ven solo pacientes que les fueron asignados explícitamente por el padre.
  - El padre asigna/desasigna profesionales desde la edición del hijo.
- **Persistencia cross-platform** del token:
  - **Mobile**: `expo-secure-store` (Keychain iOS / KeyStore Android, cifrado).
  - **Web**: `window.localStorage`.

---

## 🌐 Endpoints principales

| Método | Endpoint | Función |
|---|---|---|
| POST | `/api/users/register` | Registro (con código de invitación si es profesional) |
| POST | `/api/users/login` | Login → devuelve `{ token, user }` |
| GET | `/api/users/me` | Recuperar sesión a partir del token |
| GET | `/api/users/professionals` | Lista médicos y nutricionistas (solo padres) |
| GET | `/api/patients` | Mis hijos / mis pacientes según rol |
| POST | `/api/patients` | Crear hijo (solo padres) |
| GET | `/api/patients/:id` | Detalle de paciente |
| PUT | `/api/patients/:id` | Editar paciente + asignaciones |
| DELETE | `/api/patients/:id` | Eliminar hijo (solo padre dueño) |
| POST | `/api/patients/:id/assessment` | Evaluación nutricional OMS |
| GET | `/api/patients/:id/metrics` | Historial longitudinal (solo profesionales) |
| GET | `/api/stores` | Todas las tiendas |
| GET | `/api/stores/nearby?lat=X&lng=Y&specialties=...` | Tiendas cercanas filtradas |

---

## ✅ Requisitos del TP cumplidos

- ✅ Autenticación con persistencia y roles
- ✅ Más de tres vistas con ruteo y estado global (Context API + AuthProvider)
- ✅ Conexión con APIs externas:
  - Claude API (Anthropic) para orientación con IA
  - Tablas LMS oficiales OMS para cálculo clínico
- ✅ APIs del dispositivo:
  - `expo-location` (geolocalización)
  - `expo-secure-store` (almacenamiento seguro)
- ✅ Múltiples patrones de diseño aplicados con responsabilidad clínica real

---

## 🛠️ Convenciones del proyecto

- **Idioma**: UI y mensajes en español.
- **Módulos**: ES Modules (`import` / `export`).
- **Naming**: camelCase para variables/funciones, PascalCase para clases y componentes.
- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/) (`feat`, `fix`, `refactor`, `chore`, etc.).
- **Endpoints**: prefijo `/api/<recurso>`.
- **Path params** para recursos específicos (`/api/patients/:id`), **query params** para filtrado y búsqueda (`?lat=...&lng=...`).

---

## 📚 Referencias

- World Health Organization. *WHO Child Growth Standards*. https://www.who.int/tools/child-growth-standards
- Cole TJ. The LMS method for constructing normalized growth standards. *Eur J Clin Nutr*. 1990;44(1):45-60.
- Sociedad Argentina de Pediatría — Guías de evaluación del crecimiento.
- Anthropic. *Claude API documentation*. https://docs.claude.com

---

## 📄 Licencia

Trabajo académico — Universidad ORT Argentina, 2026.
