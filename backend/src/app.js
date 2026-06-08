import express from 'express';
import cors from 'cors';
import patientRoutes from './routes/patientRoutes.js'; // agregado 06/06



const app = express();

// Middlewares globales
app.use(cors());// conecta backend con frontend
app.use(express.json()); // Parsing de application/json

// Aquí inyectaremos el router principal más adelante (Capa Routes)
// app.use('/api/v1', mainRouter);
// Rutas
app.use('/api/patients', patientRoutes); // agregado 06/06

// Middleware de manejo de errores centralizado (Capa Middleware)
// app.use(errorHandler);

export default app;
