import express from 'express';
import mongoose from 'mongoose'; // Added missing import
import Message from '../models/message.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

/**
 * 1. STATIC ROUTES FIRST 
 * (Specific paths that don't change)
 */
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    
    const conversations = await Message.aggregate([
      { $match: { $or: [{ sender_id: userId }, { receiver_id: userId }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$donation_id",
          lastMessage: { $first: "$content" },
          lastTimestamp: { $first: "$createdAt" },
          otherParty: { $first: { $cond: [{ $eq: ["$sender_id", userId] }, "$receiver_id", "$sender_id"] } }
        }
      },
      {
        $lookup: {
          from: "donations",
          localField: "_id",
          foreignField: "_id",
          as: "donationInfo"
        }
      },
      {
        $lookup: {
          from: "users", // Ensure your collection name matches (usually lowercase/plural)
          localField: "otherParty",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      { $unwind: "$donationInfo" },
      { $unwind: "$userInfo" }
    ]);

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 2. DYNAMIC ROUTES SECOND 
 * (Paths with variables like :donationId)
 */
router.get('/:donationId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ donation_id: req.params.donationId }).sort('createdAt');
    res.json(messages);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * 3. POST ROUTES
 */
router.post('/', auth, async (req, res) => {
  try {
    // FIX: Destructure the keys exactly as they are sent from the frontend (snake_case)
    const { receiver_id, donation_id, content } = req.body;
    
    // Validate that we actually received the IDs
    if (!receiver_id || !donation_id) {
      return res.status(400).json({ error: "Missing receiver_id or donation_id" });
    }

    const msg = await Message.create({ 
      content: content,
      donation_id: donation_id, 
      receiver_id: receiver_id, 
      sender_id: req.user.id 
    });
    
    res.status(201).json(msg);
  } catch (err) {
    // This will now catch validation errors if fields are missing
    res.status(400).json({ error: err.message });
  }
});
export default router;