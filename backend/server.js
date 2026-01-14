import dotenv from 'dotenv';
// Load environment variables BEFORE importing modules that depend on them
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

// Route Imports
import authRoutes from './routes/auth.js';
import donationRoutes from './routes/donations.js';
import messageRoutes from './routes/messages.js';


import Donation from './models/donation.js';

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
  .then(async () => { // Make this callback async
    console.log("✅ MongoDB Connected");

    // --- CHANGE 2: Force Create the Index on Startup ---
    try {
      // This tells MongoDB: "Make sure the location field supports geolocation"
      await Donation.collection.createIndex({ location: "2dsphere" });
      console.log("🌍 Geospatial Index Verified");
    } catch (indexError) {
      console.error("⚠️ Index Creation Warning:", indexError.message);
    }

    app.listen(PORT, () => console.log(`🚀 Server: http://localhost:${PORT}`));
  })
  .catch(err => console.error(err));