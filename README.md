# 🍼 Healthy Little Ones - Plataforma de Seguimiento Nutricional

**Healthy Little Ones** es una plataforma integral diseñada para la gestión, seguimiento y evaluación del estado nutricional pediátrico. El sistema combina el rigor clínico de una FEA de Pediatría con una arquitectura de software robusta, garantizando la trazabilidad, precisión y escalabilidad de los datos médicos infantiles.

## 🎯 Objetivo del Sistema

La aplicación tiene como propósito centralizar la historia clínica nutricional de los pacientes pediátricos, automatizar el cálculo de requerimientos y emitir alertas tempranas sobre desviaciones en las curvas de crecimiento. 

En lugar de depender de registros manuales dispersos, el sistema actúa como un asistente clínico inteligente que unifica la ingesta, los datos antropométricos y las estrategias de recomendación.

## 🏗️ Diseño y Arquitectura (Monorepo)

El proyecto está estructurado como un **Monorepo** utilizando NPM Workspaces, aplicando el principio de alta cohesión y bajo acoplamiento entre la capa de presentación y la lógica de negocio.

```text
healthy-little-ones/
├── packages/
│   ├── frontend/   (React + Vite)
│   └── backend/    (Node.js + Express + MongoDB)
└── package.json    (Orquestador del ecosistema)