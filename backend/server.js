import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Route Imports
import authRoutes from './routes/auth.js';
import donationRoutes from './routes/donations.js';
import messageRoutes from './routes/messages.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/messages', messageRoutes);

const PORT = process.env.PORT || 5001;


// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({
    success: false,
    status,
    message,
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => console.log(`🚀 Server: http://localhost:${PORT}`));
  })
  .catch(err => console.error(err));