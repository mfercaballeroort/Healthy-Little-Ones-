# 🍼 Healthy Little Ones - Plataforma de Seguimiento Nutricional

**Healthy Little Ones** es una aplicación móvil diseñada para la gestión, seguimiento y evaluación del estado nutricional pediátrico. El sistema combina criterio clínico con una arquitectura de software robusta, garantizando trazabilidad, precisión y escalabilidad de los datos médicos infantiles.

## 🎯 Objetivo del Sistema

Centralizar la historia clínica nutricional de pacientes pediátricos, automatizar el cálculo de requerimientos y emitir alertas tempranas sobre desviaciones en las curvas de crecimiento.

## 🏗️ Arquitectura — Monorepo

El proyecto está estructurado como un **Monorepo** utilizando **NPM Workspaces**.

```text
healthy-little-ones/
├── package.json          ← package.json raíz (define los workspaces)
├── node_modules/         ← TODAS las dependencias se instalan acá (hoisting)
├── frontend/             ← React Native + Expo
│   └── package.json      ← lista sus dependencias propias
└── backend/              ← Node.js + Express + MongoDB
    └── package.json      ← lista sus dependencias propias
```

### ¿Por qué un Monorepo?

Elegimos esta estructura porque frontend y backend comparten el mismo dominio de negocio (nutrición pediátrica) y evolucionan juntos. Un monorepo nos permite:

- Gestionar ambos proyectos desde un único repositorio sin duplicar configuración.
- Coordinar cambios que afectan a ambas capas en un solo commit.
- Mantener alta cohesión y bajo acoplamiento entre la capa de presentación y la lógica de negocio.

### ¿Cómo funciona NPM Workspaces en este proyecto?

El `package.json` de la raíz declara los workspaces:

```json
{
  "workspaces": ["frontend", "backend"]
}
```

Esto cambia el comportamiento de `npm install` en dos aspectos clave:

**1. Hoisting de dependencias.** En vez de instalar dependencias duplicadas en `frontend/node_modules` y `backend/node_modules`, NPM **eleva** (hoists) todas las dependencias a un único `node_modules` en la raíz. Cuando Node.js busca un módulo (por ejemplo `require('express')` desde `backend/src/server.js`), recorre las carpetas hacia arriba hasta encontrar `node_modules`, y lo resuelve desde la raíz. Esto reduce el espacio en disco, acelera la instalación y garantiza versiones consistentes.

**2. Comandos centralizados.** Todos los `npm install` deben ejecutarse desde la **raíz** del proyecto, no desde `frontend/` o `backend/`. Si se ejecuta `npm install` dentro de un workspace, se rompe el hoisting y aparecen errores de módulos faltantes.

### Reglas de oro al trabajar con este monorepo

- ✅ Correr `npm install` **siempre desde la raíz**.
- ✅ Para agregar una dependencia a un workspace específico:
  ```bash
  npm install <paquete> --workspace=backend
  npm install <paquete> --workspace=frontend
  ```
- ❌ Nunca ejecutar `npm install` desde adentro de `frontend/` o `backend/`.
- ❌ Nunca crear manualmente `node_modules` dentro de un workspace.

## 🎨 Patrones de Diseño Aplicados

### Facade — `NutritionFacade`

**¿Por qué?** El proceso de evaluación nutricional involucra múltiples subsistemas: persistencia de métricas, determinación del estado clínico, selección de estrategia de intervención y notificación a observers. Sin una Facade, el controller debería conocer y coordinar todos esos subsistemas directamente, generando alto acoplamiento.

**Solución:** `NutritionFacade` expone un único método `executeAssessment(patientId, weight, height)` que orquesta internamente todo el flujo. El controller solo habla con la Facade.

**Implementación como Singleton:** La Facade se exporta como instancia única (`export default new NutritionFacade()`) garantizando que la lista de observers y el estado interno sean compartidos globalmente.

---

### State — `NutritionState`

**¿Por qué?** El comportamiento del sistema varía según el estado nutricional del paciente. Sin State, tendríamos cadenas de `if/else` en múltiples lugares verificando el estado, lo que viola el principio Open/Closed.

**Solución:** Tres estados concretos que encapsulan su propio comportamiento:

- `NormalState` → riesgo bajo, sin intervención urgente.
- `RiskState` → riesgo moderado, requiere monitoreo.
- `AlertState` → riesgo alto, requiere atención médica inmediata.

Cada estado sabe responder `getRiskLevel()`, `getBaseMessage()` y `requiresMedicalAttention()` sin que la Facade necesite preguntar "¿en qué estado estás?".

---

### Strategy — `NutritionStrategy`

**¿Por qué?** Las recomendaciones nutricionales varían según la condición del paciente. Si hardcodeamos la lógica de recomendación en la Facade, agregar un nuevo tipo de intervención requeriría modificar código existente.

**Solución:** Tres strategies intercambiables que la Facade selecciona en tiempo de ejecución:

- `HealthyEatingStrategy` → para pacientes en estado Normal.
- `GrowthMonitoringStrategy` → para pacientes en estado de Riesgo moderado.
- `LowWeightStrategy` → para pacientes en estado de Alerta crítica.

La Facade puede cambiar la strategy sin que ningún otro componente lo sepa.

---

### Observer — `NutritionObserver`

**¿Por qué?** Cuando se completa una evaluación nutricional, múltiples sistemas deben reaccionar: registrar en el historial, emitir alertas, sugerir contenido educativo. Sin Observer, la Facade debería conocer y llamar explícitamente a cada uno de esos sistemas, generando dependencias rígidas.

**Solución:** Tres observers concretos suscritos a la Facade:

- `HistorialObserver` → registra cada evaluación en el historial del paciente.
- `AlertObserver` → emite alerta crítica cuando el paciente requiere atención urgente.
- `ContenidoObserver` → sugiere contenido educativo según el nivel de riesgo.

La Facade llama `_notify('assessment:completed', result)` al finalizar y cada observer reacciona de forma independiente.

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Mobile | React Native + Expo |
| Backend | Node.js + Express |
| Base de datos | MongoDB Atlas + Mongoose |
| Monorepo | NPM Workspaces |
| Orquestación dev | Concurrently |

## 📋 Requisitos previos

- **Node.js** v20 LTS o superior ([nodejs.org](https://nodejs.org)).
- **NPM** v8 o superior (incluido con Node).
- Cuenta en **MongoDB Atlas** con un cluster activo y la IP del entorno de desarrollo whitelistada en *Network Access*.
- Para correr la app en el teléfono: app **Expo Go** instalada (Play Store / App Store) y el teléfono en la misma red WiFi que la PC.

## ⚙️ Configuración inicial

1. Clonar el repositorio:
   ```bash
   git clone <url-del-repo>
   cd Healthy-Little-Ones-App
   ```

2. Crear el archivo `.env` dentro de `backend/` con las variables necesarias:
   ```env
   MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/<database>
   PORT=5000
   ```

3. Instalar **todas** las dependencias desde la raíz (no desde los workspaces):
   ```bash
   npm install
   ```

   Este único comando instala las dependencias de `frontend/` y `backend/` en el `node_modules` de la raíz gracias al hoisting de workspaces.

## 🚀 Cómo correr el proyecto

Todos los comandos se ejecutan desde la raíz del proyecto.

### Correr ambos en paralelo (recomendado para desarrollo)

```bash
npm run dev
```

Esto usa **Concurrently** para arrancar backend y frontend al mismo tiempo en la misma terminal. Los logs aparecen prefijados con `[0]` (backend) y `[1]` (frontend).

### Correr solo el backend

```bash
npm run dev:backend
```

Levanta el servidor Express con Nodemon en `http://localhost:5000` y conecta a MongoDB Atlas.

### Correr solo el frontend

```bash
npm run dev:frontend
```

Inicia Metro Bundler de Expo en `http://localhost:8081`. Desde la terminal interactiva podés:

- Presionar `w` → abrir la app en el navegador.
- Presionar `a` → abrir en emulador Android.
- Presionar `i` → abrir en simulador iOS (solo Mac).
- Escanear el **QR code** con la app **Expo Go** del teléfono.

## 🐛 Troubleshooting

### `Error: Cannot find module 'xxx'` al arrancar el backend

Significa que el `node_modules` no se instaló correctamente. Causas comunes:

1. Se ejecutó `npm install` desde adentro de `backend/` o `frontend/` en vez de la raíz.
2. Hay un `node_modules` parcial dentro de algún workspace que rompe el hoisting.

**Solución (reinstalación limpia desde la raíz):**

```bash
# Borrar todos los node_modules y lockfiles del monorepo
cmd /c "rmdir /s /q node_modules"
cmd /c "rmdir /s /q backend\node_modules"
cmd /c "rmdir /s /q frontend\node_modules"
rm package-lock.json backend/package-lock.json frontend/package-lock.json

# Reinstalar desde la raíz
npm install
```

### `Could not connect to any servers in your MongoDB Atlas cluster`

Tu IP no está whitelistada en Atlas. Ir a [cloud.mongodb.com](https://cloud.mongodb.com) → tu proyecto → **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`) para desarrollo, o **Add Current IP Address** para una IP específica.

### El frontend no se conecta al backend desde el teléfono

`localhost` en el teléfono se refiere al teléfono mismo, no a tu PC. Cambiar la URL base del backend en el código del frontend por la **IP local de tu PC** (ej: `http://192.168.1.42:5000`). Para obtenerla: `ipconfig` en Windows o `ifconfig` en Linux/Mac.

### `Missing script: "dev"` en algún workspace

El workspace no tiene un script `dev` definido en su `package.json`. Verificar que tanto `frontend/package.json` como `backend/package.json` tengan la entrada `"dev"` en la sección `"scripts"`.
