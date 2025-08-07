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
import './mqttClient.js'; 
import usageRoutes from './routes/usageRoutes.js';
import espRoutes from "./routes/espRoutes.js";
import predictionRoutes from './routes/predictionRoutes.js';
import changepasswordRoutes from './routes/changepassword.js';

dotenv.config();
const app = express();

// Middlewares
const allowedOrigins = ['https://sanziroll.vercel.app', 'http://localhost:5173'];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);



app.use(express.json());

app.get('/', (req, res) => {
  res.send('🚀 Smart Dispense Backend is running!');
});

// Routes
app.use('/api/buildings', buildingRoutes);
app.use('/api/esp', espRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/dispensers', dispenserRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/dispenser', dispenserRoutes);
app.use('/api/predictions', predictionRoutes); 
app.use('/api/user', changepasswordRoutes);
// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



