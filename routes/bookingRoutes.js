import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';

const router = express.Router();

// Create booking
router.post('/', protect, async (req, res) => {
  try {
    const booking = await Booking.create({
      ...req.body,
      senior: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error creating booking',
      error: error.message 
    });
  }
});

// Get all bookings for current user
router.get('/', protect, async (req, res) => {
  try {
    const query = req.userType === 'caregiver' 
      ? { caregiver: req.user.id }
      : { senior: req.user.id };

    const bookings = await Booking.find(query)
      .populate('caregiver', 'fullName profilePhoto rating')
      .populate('senior', 'guardianName seniorName phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching bookings',
      error: error.message 
    });
  }
});

// Get single booking
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('caregiver')
      .populate('senior');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching booking',
      error: error.message 
    });
  }
});

// Update booking status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({
      success: true,
      message: 'Booking status updated',
      data: booking
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error updating booking',
      error: error.message 
    });
  }
});

// Cancel booking
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'cancelled',
        cancelledBy: req.userType,
        cancellationReason: reason,
        cancellationDate: Date.now()
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error cancelling booking',
      error: error.message 
    });
  }
});

// Add review for completed booking
router.post('/:id/review', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed bookings' });
    }

    if (booking.reviewed) {
      return res.status(400).json({ message: 'Booking already reviewed' });
    }

    const review = await Review.create({
      caregiver: booking.caregiver,
      senior: booking.senior,
      booking: booking._id,
      rating: req.body.rating,
      comment: req.body.comment
    });

    booking.reviewed = true;
    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error submitting review',
      error: error.message 
    });
  }
});

// Get reviews for a caregiver
router.get('/caregiver/:caregiverId/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ 
      caregiver: req.params.caregiverId,
      isVisible: true 
    })
      .populate('senior', 'guardianName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching reviews',
      error: error.message 
    });
  }
});

export default router;