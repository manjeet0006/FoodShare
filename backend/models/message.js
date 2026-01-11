import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  donation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', required: true },
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  read_at: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);