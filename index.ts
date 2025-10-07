import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // ✅ Importamos cors
import authRoutes from './routes/authRoutes';
import medicRoutes from './routes/medicRoutes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors()); // ✅ Permite cualquier origen (para desarrollo)
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('🚀 API funcionando');
});

app.use('/api/auth', authRoutes);
app.use('/api/medic', medicRoutes);

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});

export default app
