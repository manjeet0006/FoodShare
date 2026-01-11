// backend/models/Donation.js
import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  donator_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  food_type: { type: String, required: true },
  quantity: { type: String, required: true },
  city: { type: String, required: true },
  pickup_address: { type: String, required: true },
  expires_at: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['available', 'claimed', 'completed'], 
    default: 'available' 
  },
  claimed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  claimed_at: Date
}, { timestamps: true });

export default mongoose.model('Donation', donationSchema);