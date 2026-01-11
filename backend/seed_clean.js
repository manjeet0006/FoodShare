import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Donation from './models/Donation.js';
import Message from './models/message.js';

dotenv.config();

const clearDatabase = async () => {
  try {
    // 1. Connect to MongoDB using your URI
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for clean-up...");

    // 2. Delete data from specific collections
    // This removes the 58 entries and users created earlier
    const donationResult = await Donation.deleteMany({});
    const userResult = await User.deleteMany({});
    const messageResult = await Message.deleteMany({});

    console.log("--- CLEAN-UP SUMMARY ---");
    console.log(`Donations removed: ${donationResult.deletedCount}`);
    console.log(`Users removed:     ${userResult.deletedCount}`);
    console.log(`Messages removed:  ${messageResult.deletedCount}`);
    console.log("------------------------");

    console.log("Database is now clean!");
    process.exit(0);
  } catch (error) {
    console.error("Error during deletion:", error);
    process.exit(1);
  }
};

clearDatabase();