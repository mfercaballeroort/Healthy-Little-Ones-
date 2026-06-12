# 🍼 Healthy Little Ones - Plataforma de Seguimiento Nutricional

**Healthy Little Ones** es una aplicación móvil diseñada para la gestión, seguimiento y evaluación del estado nutricional pediátrico. El sistema combina criterio clínico con una arquitectura de software robusta, garantizando trazabilidad, precisión y escalabilidad de los datos médicos infantiles.

## 🎯 Objetivo del Sistema

Centralizar la historia clínica nutricional de pacientes pediátricos, automatizar el cálculo de requerimientos y emitir alertas tempranas sobre desviaciones en las curvas de crecimiento.

## 🏗️ Arquitectura — Monorepo

El proyecto está estructurado como un **Monorepo** utilizando NPM Workspaces.

```text
healthy-little-ones/
├── frontend/   (React Native + Expo)
├── backend/    (Node.js + Express + MongoDB)
└── package.json
```

### ¿Por qué un Monorepo?

Elegimos esta estructura porque frontend y backend comparten el mismo dominio de negocio (nutrición pediátrica) y evolucionan juntos. Un monorepo nos permite:

- Gestionar ambos proyectos desde un único repositorio sin duplicar configuración
- Coordinar cambios que afectan a ambas capas en un solo commit
- Mantener alta cohesión y bajo acoplamiento entre la capa de presentación y la lógica de negocio

## 🎨 Patrones de Diseño Aplicados

### Facade — `NutritionFacade`

**¿Por qué?** El proceso de evaluación nutricional involucra múltiples subsistemas: persistencia de métricas, determinación del estado clínico, selección de estrategia de intervención y notificación a observers. Sin una Facade, el controller debería conocer y coordinar todos esos subsistemas directamente, generando alto acoplamiento.

**Solución:** `NutritionFacade` expone un único método `executeAssessment(patientId, weight, height)` que orquesta internamente todo el flujo. El controller solo habla con la Facade.

**Implementación como Singleton:** La Facade se exporta como instancia única (`export default new NutritionFacade()`) garantizando que la lista de observers y el estado interno sean compartidos globalmente.

---

### State — `NutritionState`

**¿Por qué?** El comportamiento del sistema varía según el estado nutricional del paciente. Sin State, tendríamos cadenas de `if/else` en múltiples lugares verificando el estado, lo que viola el principio Open/Closed.

**Solución:** Tres estados concretos que encapsulan su propio comportamiento:

- `NormalState` → riesgo bajo, sin intervención urgente
- `RiskState` → riesgo moderado, requiere monitoreo
- `AlertState` → riesgo alto, requiere atención médica inmediata

Cada estado sabe responder `getRiskLevel()`, `getBaseMessage()` y `requiresMedicalAttention()` sin que la Facade necesite preguntar "¿en qué estado estás?".

---

### Strategy — `NutritionStrategy`

**¿Por qué?** Las recomendaciones nutricionales varían según la condición del paciente. Si hardcodeamos la lógica de recomendación en la Facade, agregar un nuevo tipo de intervención requeriría modificar código existente.

**Solución:** Tres strategies intercambiables que la Facade selecciona en tiempo de ejecución:

- `HealthyEatingStrategy` → para pacientes en estado Normal
- `GrowthMonitoringStrategy` → para pacientes en estado de Riesgo moderado
- `LowWeightStrategy` → para pacientes en estado de Alerta crítica

La Facade puede cambiar la strategy sin que ningún otro componente lo sepa.

---

### Observer — `NutritionObserver`

**¿Por qué?** Cuando se completa una evaluación nutricional, múltiples sistemas deben reaccionar: registrar en el historial, emitir alertas, sugerir contenido educativo. Sin Observer, la Facade debería conocer y llamar explícitamente a cada uno de esos sistemas, generando dependencias rígidas.

**Solución:** Tres observers concretos suscritos a la Facade:

- `HistorialObserver` → registra cada evaluación en el historial del paciente
- `AlertObserver` → emite alerta crítica cuando el paciente requiere atención urgente
- `ContenidoObserver` → sugiere contenido educativo según el nivel de riesgo

La Facade llama `_notify('assessment:completed', result)` al finalizar y cada observer reacciona de forma independiente.

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Mobile | React Native + Expo |
| Backend | Node.js + Express |
| Base de datos | MongoDB + Mongoose |
| Monorepo | NPM Workspaces |

## 🚀 Cómo correr el proyecto

```bash
# Instalar dependencias
npm install

# Correr backend
npm run dev:backend

# Correr frontend
npm run dev:frontend

# Correr ambos en paralelo
npm run dev
```