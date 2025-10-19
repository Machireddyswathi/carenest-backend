import Caregiver from '../models/Caregiver.js';

// Get all pending caregivers (for admin dashboard)
export const getPendingCaregivers = async (req, res) => {
  try {
    const pendingCaregivers = await Caregiver.find({ 
      status: 'pending' 
    }).sort({ registeredAt: -1 }); // Newest first

    res.status(200).json({
      success: true,
      count: pendingCaregivers.length,
      caregivers: pendingCaregivers
    });
  } catch (error) {
    console.error('Error fetching pending caregivers:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch pending caregivers', 
      error: error.message 
    });
  }
};

// Approve a caregiver
export const approveCaregiver = async (req, res) => {
  try {
    const { caregiverId } = req.params;

    const caregiver = await Caregiver.findByIdAndUpdate(
      caregiverId,
      {
        status: 'approved',
        isVerified: true,
        verifiedAt: new Date(),
        'documents.aadhaar.verified': true,
        'documents.pan.verified': true
      },
      { new: true }
    );

    if (!caregiver) {
      return res.status(404).json({ 
        success: false, 
        message: 'Caregiver not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Caregiver approved successfully',
      caregiver
    });
  } catch (error) {
    console.error('Error approving caregiver:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to approve caregiver', 
      error: error.message 
    });
  }
};

// Reject a caregiver
export const rejectCaregiver = async (req, res) => {
  try {
    const { caregiverId } = req.params;
    const { reason } = req.body;

    const caregiver = await Caregiver.findByIdAndUpdate(
      caregiverId,
      {
        status: 'rejected',
        rejectionReason: reason || 'Documents verification failed'
      },
      { new: true }
    );

    if (!caregiver) {
      return res.status(404).json({ 
        success: false, 
        message: 'Caregiver not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Caregiver rejected',
      caregiver
    });
  } catch (error) {
    console.error('Error rejecting caregiver:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reject caregiver', 
      error: error.message 
    });
  }
};

// Get caregiver details with documents (for verification)
export const getCaregiverDetails = async (req, res) => {
  try {
    const { caregiverId } = req.params;

    const caregiver = await Caregiver.findById(caregiverId);

    if (!caregiver) {
      return res.status(404).json({ 
        success: false, 
        message: 'Caregiver not found' 
      });
    }

    res.status(200).json({
      success: true,
      caregiver
    });
  } catch (error) {
    console.error('Error fetching caregiver details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch caregiver details', 
      error: error.message 
    });
  }
};