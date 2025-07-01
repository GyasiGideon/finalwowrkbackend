// server.js (or index.js)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import buildingRoutes from './routes/biuldingRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import dispenserRoutes from './routes/dispenseRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import authRoutes from './routes/authRoutes.js';
import logRoutes from './routes/logRoutes.js';
import { notFound, errorHandler } from './middleware/middleware.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

dotenv.config();
const app = express();

// Middlewares
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

// Routes
app.use('/api/buildings', buildingRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/dispensers', dispenserRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/dashboard', dashboardRoutes);
// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server running`));
}

export default app;
