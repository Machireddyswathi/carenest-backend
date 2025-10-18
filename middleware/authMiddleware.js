import jwt from 'jsonwebtoken';
import Caregiver from '../models/Caregiver.js';
import Senior from '../models/Senior.js';

export const protect = async (req, res, next) => {
  let token;

  // Check for token in header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user (check both Caregiver and Senior collections)
    let user = await Caregiver.findById(decoded.id).select('-password');
    
    if (user) {
      req.user = user;
      req.userType = 'caregiver';
    } else {
      user = await Senior.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
        req.userType = 'family';
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Middleware to check if user is a caregiver
export const caregiverOnly = async (req, res, next) => {
  if (req.userType !== 'caregiver') {
    return res.status(403).json({ message: 'Access denied. Caregivers only.' });
  }
  next();
};

// Middleware to check if user is a senior/family
export const familyOnly = async (req, res, next) => {
  if (req.userType !== 'family') {
    return res.status(403).json({ message: 'Access denied. Families only.' });
  }
  next();
};