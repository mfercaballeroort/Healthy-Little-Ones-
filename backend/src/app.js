import express from 'express';
import cors from 'cors';

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json()); // Parsing de application/json

// Aquí inyectaremos el router principal más adelante (Capa Routes)
// app.use('/api/v1', mainRouter);

// Middleware de manejo de errores centralizado (Capa Middleware)
// app.use(errorHandler);

export default app;