import app from './app.js';
import { connectDB } from './data/database.js';
import dotenv from 'dotenv';

// Cargamos variables de entorno en el entry point principal
dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // 1. Inicializar la capa de persistencia ANTES de levantar la red
        await connectDB();
        
        // 2. Inicializar el servidor HTTP
        app.listen(PORT, () => {
            console.log(`[Backend] Servidor HTTP inicializado en el puerto ${PORT}`);
            console.log(`[Backend] Entorno: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error(`[Backend] Falla catastrófica en el arranque: ${error.message}`);
        process.exit(1);
    }
};

// Disparar el proceso
startServer();