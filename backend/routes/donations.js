import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
// removed multer-storage-cloudinary in favor of memory upload + cloudinary.uploader

import Donation from "../models/donation.js"
import { auth, isDonator } from '../middleware/auth.js';

const router = express.Router();

// ----------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Configure multer to store uploads in memory, we'll upload to Cloudinary manually
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

/**
 * @route   POST /api/donations
 * @desc    Create a new donation with optional image
 */
/**
 * @route   POST /api/donations
 * @desc    Create a new donation with optional image
 */
router.post('/', [auth, isDonator], (req, res) => {
  const uploadSingle = upload.single('image');

  uploadSingle(req, res, async (err) => {
    if (err) {
      console.error("Multer Upload Error:", err);
      return res.status(400).json({ error: err.message });
    }

    try {
      // --- ROBUST CLOUDINARY CONFIGURATION ---
      // We configure it here to ensure it uses the latest process.env values
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
        api_key: process.env.CLOUDINARY_API_KEY?.trim(),
        api_secret: process.env.CLOUDINARY_API_SECRET?.trim()
      });

      const donationData = {
        ...req.body,
        donator_id: req.user.id,
        status: 'available'
      };

      // 4. If there's a file, upload to Cloudinary manually
      if (req.file && req.file.buffer) {
        try {
          const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: 'sharefood_donations',
                resource_type: 'image'
              },
              (error, result) => {
                if (error) return reject(error);
                resolve(result);
              }
            );
            stream.end(req.file.buffer);
          });

          console.log("✅ Cloudinary upload successful:", uploadResult.secure_url);
          donationData.image = uploadResult.secure_url;
        } catch (cloudErr) {
          console.error("❌ Cloudinary upload error:", cloudErr);
          return res.status(500).json({ error: 'Cloudinary upload failed: ' + cloudErr.message });
        }
      }

      // Convert expires_at string to Date if present
      if (donationData.expires_at) {
        donationData.expires_at = new Date(donationData.expires_at);
      }

      const donation = await Donation.create(donationData);
      res.status(201).json(donation);

    } catch (dbErr) {
      console.error("Database Error:", dbErr);
      res.status(400).json({ error: dbErr.message });
    }
  });
});

/**
 * @route   GET /api/donations/feed
 * @desc    Get all available and non-expired donations
 * @access  Public
 */
// backend/routes/donations.js
router.get('/feed', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const matchQuery = { status: 'available', expires_at: { $gte: new Date() } };

    if (lat && lng) {
      try {
        const donations = await Donation.aggregate([
          {
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [parseFloat(lng), parseFloat(lat)]
              },
              distanceField: "distance",
              spherical: true,
              query: { status: 'available' } // This is where filters go
            }
          }
        ]);

        await Donation.populate(donations, { path: 'donator_id', select: 'fullName organizationName' });
        return res.json(donations);
      } catch (geoErr) {
        console.error('Geo query failed, falling back to non-geo feed:', geoErr);
        // fallback to simple available list when geo query fails (e.g., missing 2dsphere index)
        const fallback = await Donation.find(matchQuery).populate('donator_id', 'fullName organizationName').sort({ createdAt: -1 });
        return res.json(fallback);
      }
    }

    // Default fallback sort
    const list = await Donation.find(matchQuery).populate('donator_id').sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   GET /api/donations/my-donations
 * @desc    Get donations related to the logged-in user (posted or claimed)
 * @access  Private
 */
router.get('/my-donations', auth, async (req, res) => {
  try {
    // Filter logic based on the user role in the JWT
    const filter = req.user.role === 'donator'
      ? { donator_id: req.user.id }
      : { claimed_by: req.user.id };

    const list = await Donation.find(filter)
      .populate('donator_id', 'fullName organizationName')
      .sort({ createdAt: -1 });

    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   GET /api/donations/:id
 * @desc    Get a single donation by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id).populate('donator_id', 'fullName organizationName');
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    res.json(donation);
  } catch (err) {
    // If the ID format is invalid, Mongoose throws a CastError which has a 'kind' property of 'ObjectId'
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Donation not found (Invalid ID format)' });
    }
    console.error("Error fetching donation by ID:", err);
    res.status(500).json({ error: 'Server error while fetching donation.' });
  }
});


/**
 * @route   GET /api/donations/my-donations
 * @desc    Get donations related to the logged-in user (posted or claimed)
 * @access  Private
 */


/**
 * @route   PATCH /api/donations/:id/status
 * @desc    Update donation status (Claim by Receiver or Complete by Donator)
 * @access  Private
 */
router.patch('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  const donationId = req.params.id;

  try {
    const donation = await Donation.findById(donationId);
    if (!donation) return res.status(404).json({ message: "Donation not found" });

    let updateData = { status };

    // ROLE LOGIC: Only receivers can claim "available" food
    if (status === 'claimed') {
      if (req.user.role !== 'receiver') {
        return res.status(403).json({ message: "Only NGOs/Receivers can claim donations." });
      }
      if (donation.status !== 'available') {
        return res.status(400).json({ message: "This item is no longer available." });
      }
      updateData.claimed_by = req.user.id;
      updateData.claimed_at = new Date();
    }

    // ROLE LOGIC: Only the original donator can mark it as "completed" (picked up)
    if (status === 'completed') {
      if (donation.donator_id.toString() !== req.user.id) {
        return res.status(403).json({ message: "Only the original donor can mark this as completed." });
      }
    }

    const updatedDonation = await Donation.findByIdAndUpdate(
      donationId,
      updateData,
      { new: true }
    );

    res.json(updatedDonation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});




/**
 * @route   GET /api/donations/stats/global
 * @desc    Get aggregate stats for Hero section (Total weight, NGO count, etc)
 * @access  Public
 */
router.get('/stats/global', async (req, res) => {
  try {
    const stats = await Donation.aggregate([
      {
        $facet: {
          // 1. Calculate Total Weight (only for completed rescues)
          "totalWeight": [
            { $match: { status: "completed" } },
            {
              $group: {
                _id: null,
                // We use $toDouble to handle strings like "10" or "5.5"
                total: { $sum: { $toDouble: "$quantity" } }
              }
            }
          ],
          // 2. Count Unique NGOs (receivers who have claimed or completed)
          "ngoCount": [
            { $match: { claimed_by: { $exists: true } } },
            { $group: { _id: "$claimed_by" } },
            { $count: "count" }
          ],
          // 3. Average Rescue Time (minutes between creation and completion)
          "rescueTime": [
            { $match: { status: "completed" } },
            {
              $project: {
                diff: { $subtract: ["$updatedAt", "$createdAt"] }
              }
            },
            {
              $group: {
                _id: null,
                avgMs: { $avg: "$diff" }
              }
            }
          ],
          // 4. Success Rate (Impact %)
          "impact": [
            {
              $group: {
                _id: null,
                completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
                total: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    // Format the response for the frontend
    const results = stats[0];
    const totalWeight = results.totalWeight[0]?.total || 0;
    const ngoCount = results.ngoCount[0]?.count || 0;
    const avgMinutes = results.rescueTime[0]?.avgMs ? Math.round(results.rescueTime[0].avgMs / 60000) : 0;
    const impactData = results.impact[0];
    const successRate = impactData?.total > 0 ? Math.round((impactData.completed / impactData.total) * 100) : 0;

    res.json({
      totalWeight,
      ngoCount,
      avgMinutes,
      successRate
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   PATCH /api/donations/:id/cancel-claim
 * @desc    Revert a claimed donation back to available
 * @access  Private (Donor or the Receiver who claimed it)
 */
router.patch('/:id/cancel-claim', auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: "Not found" });

    const isDonor = donation.donator_id.toString() === req.user.id;
    const isReceiver = donation.claimed_by?.toString() === req.user.id;

    if (!isDonor && !isReceiver) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Revert to available
    donation.status = 'available';
    donation.claimed_by = null;
    donation.claimed_at = null;
    await donation.save();

    res.json({ message: "Order returned to donation pool", donation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   DELETE /api/donations/:id
 * @desc    Delete a donation permanently
 * @access  Private (Donor only)
 */
router.delete('/:id', auth, isDonator, async (req, res) => {
  try {
    const donation = await Donation.findOneAndDelete({
      _id: req.params.id,
      donator_id: req.user.id
    });
    if (!donation) return res.status(404).json({ message: "Donation not found" });
    res.json({ message: "Donation deleted permanently" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;