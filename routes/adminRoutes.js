import express from 'express';
import { 
  getPendingCaregivers, 
  approveCaregiver, 
  rejectCaregiver,
  getCaregiverDetails 
} from '../controllers/adminController.js';
// import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// TODO: Add authentication middleware
// For now, these are open - you should add admin auth later

// Get all pending caregivers
router.get('/caregivers/pending', getPendingCaregivers);

// Get caregiver details (with documents)
router.get('/caregivers/:caregiverId', getCaregiverDetails);

// Approve a caregiver
router.patch('/caregivers/:caregiverId/approve', approveCaregiver);

// Reject a caregiver
router.patch('/caregivers/:caregiverId/reject', rejectCaregiver);

export default router;