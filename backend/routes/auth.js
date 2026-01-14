import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Matches Signup.tsx logic
router.post('/signup', async (req, res) => {

  try {
    const { email, password, full_name, organization_name, phone, address, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, fullName: full_name, organizationName: organization_name, phone, address, role });
    
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.status(201).json({ token, user });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user });
  } else {
    res.status(400).json({ message: "Invalid credentials" });
  }
});

// Matches Settings.tsx / AuthContext.tsx
router.get('/profile', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

router.get('/me', auth, async (req, res) => {
  try {
    // req.user.id comes from your 'auth' middleware
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server authentication error" });
  }
});

router.patch('/profile', auth, async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, { new: true });
  res.json(updatedUser);
});

// Matches DonationCard.jsx
// Unprotected route to get public user info
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('fullName organizationName');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;