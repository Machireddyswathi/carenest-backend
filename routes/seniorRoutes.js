import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Senior from '../models/Senior.js';

const router = express.Router();

// Get senior profile
router.get('/profile', protect, async (req, res) => {
  try {
    const senior = await Senior.findById(req.user.id).select('-password');
    
    if (!senior) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({
      success: true,
      data: senior
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching profile',
      error: error.message 
    });
  }
});

// Update senior profile
router.put('/profile', protect, async (req, res) => {
  try {
    const allowedUpdates = [
      'phone',
      'address',
      'careType',
      'medicalConditions',
      'specialNeeds',
      'preferredGender',
      'budget',
      'additionalInfo'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const senior = await Senior.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!senior) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: senior
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error updating profile',
      error: error.message 
    });
  }
});

export default router;