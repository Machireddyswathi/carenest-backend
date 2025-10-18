import express from 'express';
import { 
  registerCaregiver, 
  registerSenior, 
  login, 
  getCurrentUser 
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Register routes
router.post('/register/caregiver', upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'aadhaarCard', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
  { name: 'certificates', maxCount: 5 }
]), registerCaregiver);

router.post('/register/senior', registerSenior);

// Login route
router.post('/login', login);

// Get current user (protected)
router.get('/me', protect, getCurrentUser);

export default router;