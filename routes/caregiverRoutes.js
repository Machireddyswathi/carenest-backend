import express from 'express';
import { 
  getAllCaregivers,
  getCaregiverById,
  updateCaregiver,
  deleteCaregiver,
  getCaregiverStats
} from '../controllers/caregiverController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllCaregivers);
router.get('/:id', getCaregiverById);

// Protected routes (requires authentication)
router.put('/profile', protect, updateCaregiver);
router.delete('/profile', protect, deleteCaregiver);
router.get('/stats/dashboard', protect, getCaregiverStats);

export default router;