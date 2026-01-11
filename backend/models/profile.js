import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true }, // Links to your Auth system
  fullName: String,
  phone: String,
  role: { type: String, required: true }, // e.g., 'donor', 'receiver'
  organizationName: String,
  address: String,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model('Profile', profileSchema);