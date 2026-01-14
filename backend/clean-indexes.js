import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const clean = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    
    console.log("🧹 Dropping all indexes on donations...");
    // This removes every index except the default _id index
    await db.collection('donations').dropIndexes();
    
    console.log("✨ Creating a single, clean 2dsphere index...");
    await db.collection('donations').createIndex({ location: "2dsphere" });
    
    console.log("✅ Database Cleaned. Only one geospatial index remains.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

clean();