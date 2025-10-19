import Caregiver from '../models/Caregiver.js';
import { 
  sendCaregiverRegistrationEmail, 
  sendAdminNotificationEmail 
} from '../services/emailService.js';  // ✅ Added email imports


// ================================
// Register a new caregiver
// ================================
export const registerCaregiver = async (req, res) => {
  try {
    const caregiver = await Caregiver.create(req.body);

    // ✉️ Send emails after registration
    await sendCaregiverRegistrationEmail(caregiver);
    await sendAdminNotificationEmail(caregiver);

    res.status(201).json({
      success: true,
      message: 'Caregiver registered successfully! Confirmation email sent.',
      caregiver
    });
  } catch (error) {
    console.error('Error registering caregiver:', error);
    res.status(500).json({ 
      success: false,
      message: 'Registration failed',
      error: error.message 
    });
  }
};


// ================================
// Get all verified caregivers
// ================================
export const getAllCaregivers = async (req, res) => {
  try {
    const { 
      search, 
      location, 
      specialization, 
      minRate, 
      maxRate,
      sortBy = 'rating',
      page = 1,
      limit = 10 
    } = req.query;

    const query = { 
      verificationStatus: 'verified',
      isActive: true 
    };

    // Search by name or bio
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by location
    if (location) {
      query['address.city'] = { $regex: location, $options: 'i' };
    }

    // Filter by specialization
    if (specialization) {
      query.specializations = specialization;
    }

    // Filter by rate range
    if (minRate || maxRate) {
      query.hourlyRate = {};
      if (minRate) query.hourlyRate.$gte = parseFloat(minRate);
      if (maxRate) query.hourlyRate.$lte = parseFloat(maxRate);
    }

    // Sorting
    let sort = {};
    switch (sortBy) {
      case 'rating':
        sort = { rating: -1 };
        break;
      case 'experience':
        sort = { experience: -1 };
        break;
      case 'price-low':
        sort = { hourlyRate: 1 };
        break;
      case 'price-high':
        sort = { hourlyRate: -1 };
        break;
      default:
        sort = { rating: -1 };
    }

    // Pagination
    const skip = (page - 1) * limit;

    const caregivers = await Caregiver.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .select('-password -aadhaarNumber -panNumber -aadhaarCard -panCard');

    const total = await Caregiver.countDocuments(query);

    res.json({
      success: true,
      count: caregivers.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: caregivers
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching caregivers',
      error: error.message 
    });
  }
};


// ================================
// Get single caregiver by ID
// ================================
export const getCaregiverById = async (req, res) => {
  try {
    const caregiver = await Caregiver.findById(req.params.id)
      .select('-password -aadhaarNumber -panNumber -aadhaarCard -panCard');

    if (!caregiver) {
      return res.status(404).json({ message: 'Caregiver not found' });
    }

    if (caregiver.verificationStatus !== 'verified' || !caregiver.isActive) {
      return res.status(403).json({ message: 'Caregiver profile is not available' });
    }

    res.json({
      success: true,
      data: caregiver
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching caregiver',
      error: error.message 
    });
  }
};


// ================================
// Update caregiver profile
// ================================
export const updateCaregiver = async (req, res) => {
  try {
    const allowedUpdates = [
      'phone',
      'address',
      'experience',
      'education',
      'specializations',
      'languages',
      'availability',
      'hourlyRate',
      'bio',
      'certifications',
      'isAvailable'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const caregiver = await Caregiver.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!caregiver) {
      return res.status(404).json({ message: 'Caregiver not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: caregiver
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error updating profile',
      error: error.message 
    });
  }
};


// ================================
// Delete caregiver account
// ================================
export const deleteCaregiver = async (req, res) => {
  try {
    const caregiver = await Caregiver.findByIdAndUpdate(
      req.user.id,
      { isActive: false },
      { new: true }
    );

    if (!caregiver) {
      return res.status(404).json({ message: 'Caregiver not found' });
    }

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error deactivating account',
      error: error.message 
    });
  }
};


// ================================
// Get caregiver stats (for dashboard)
// ================================
export const getCaregiverStats = async (req, res) => {
  try {
    const caregiver = await Caregiver.findById(req.user.id);

    if (!caregiver) {
      return res.status(404).json({ message: 'Caregiver not found' });
    }

    const stats = {
      totalBookings: caregiver.totalBookings,
      completedBookings: caregiver.completedBookings,
      totalHoursWorked: caregiver.totalHoursWorked,
      rating: caregiver.rating,
      reviewCount: caregiver.reviewCount,
      earnings: caregiver.totalHoursWorked * caregiver.hourlyRate
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching stats',
      error: error.message 
    });
  }
};
