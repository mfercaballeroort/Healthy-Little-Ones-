import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargamos las variables de entorno desde el archivo .env
dotenv.config();

export const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        
        if (!uri) {
            throw new Error("La variable MONGO_URI no está definida en el entorno.");
        }

        const conn = await mongoose.connect(uri);
        console.log(`[Data] MongoDB conectado exitosamente: ${conn.connection.host}`);
        
    } catch (error) {
        console.error(`[Data] Error crítico de conexión DB: ${error.message}`);
        // Finaliza el proceso de Node.js con código de error 1 (Fail-Fast)
        process.exit(1); 
    }
};