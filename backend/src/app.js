import express from 'express';
import cors from 'cors';
import patientRoutes from './routes/patientRoutes.js'; // agregado 06/06
import nutritionRoutes from './routes/nutritionRoutes.js'; // agregado 08/06
import metricRoutes from './routes/metricRoutes.js'; // agregado 11/06
import userRoutes from './routes/userRoutes.js';
import storeRoutes from './routes/storeRoutes.js';


const app = express();

// Middlewares globales
app.use(cors());// conecta backend con frontend
app.use(express.json()); // Parsing de application/json
app.use('/api/stores', storeRoutes);
// Aquí inyectaremos el router principal más adelante (Capa Routes)
// app.use('/api/v1', mainRouter);
// Rutas
app.use('/api/patients', patientRoutes); // agregado 06/06
app.use('/api/metrics', metricRoutes); // agregado 11/06
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/users', userRoutes);

// Middleware de manejo de errores centralizado (Capa Middleware)
// app.use(errorHandler);

export default app;
