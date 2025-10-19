import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Caregiver from '../models/Caregiver.js';
import Senior from '../models/Senior.js';
import { 
  sendCaregiverRegistrationEmail, 
  sendAdminNotificationEmail 
} from '../services/emailService.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Register Caregiver
export const registerCaregiver = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      dateOfBirth,
      gender,
      aadhaarNumber,
      panNumber,
      experience,
      education,
      availability,
      hourlyRate,
      bio,
      password
    } = req.body;

    // Parse address if it's a string
    let address = req.body.address;
    if (typeof address === 'string') {
      try {
        address = JSON.parse(address);
      } catch (e) {
        address = { street: req.body.address, city: req.body.city, state: req.body.state, pincode: req.body.pincode };
      }
    }

    // Parse arrays if they're strings
    let specializations = req.body.specializations;
    if (typeof specializations === 'string') {
      try {
        specializations = JSON.parse(specializations);
      } catch (e) {
        specializations = specializations.split(',');
      }
    }

    let languages = req.body.languages;
    if (typeof languages === 'string') {
      try {
        languages = JSON.parse(languages);
      } catch (e) {
        languages = languages.split(',');
      }
    }

    let certifications = req.body.certifications;
    if (typeof certifications === 'string') {
      certifications = certifications.split(',').map(c => c.trim()).filter(c => c);
    }

    // Check if caregiver already exists
    const caregiverExists = await Caregiver.findOne({ 
      $or: [{ email }, { aadhaarNumber }, { panNumber }] 
    });

    if (caregiverExists) {
      return res.status(400).json({ 
        success: false,
        message: 'Caregiver with this email, Aadhaar or PAN already exists' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create caregiver
    const caregiver = await Caregiver.create({
      fullName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      aadhaarNumber,
      panNumber,
      aadhaarCard: req.files?.aadhaarCard?.[0]?.path || 'pending',
      panCard: req.files?.panCard?.[0]?.path || 'pending',
      profilePhoto: req.files?.profilePhoto?.[0]?.path,
      experience: parseInt(experience),
      education,
      specializations,
      languages,
      availability,
      hourlyRate: parseInt(hourlyRate),
      bio,
      certifications: certifications || [],
      certificateFiles: req.files?.certificates?.map(f => f.path) || [],
      references: req.body.references || '',
      password: hashedPassword
    });

    // Send emails
    try {
      await sendCaregiverRegistrationEmail(caregiver);
      await sendAdminNotificationEmail(caregiver);
      console.log('✅ Registration emails sent');
    } catch (emailError) {
      console.error('⚠️ Email sending failed (but registration succeeded):', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Caregiver registered successfully! Your documents will be verified within 24-48 hours. You will receive an email once approved.',
      data: {
        id: caregiver._id,
        fullName: caregiver.fullName,
        email: caregiver.email,
        verificationStatus: caregiver.verificationStatus,
        status: caregiver.status
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error registering caregiver: ' + error.message,
      error: error.message 
    });
  }
};

// Register Senior/Family - ✅ FIXED
export const registerSenior = async (req, res) => {
  try {
    const {
      guardianName,
      email,
      phone,
      relationship,
      seniorName,
      seniorAge,
      address,      // Can be string or object
      city,         // Flat fields from frontend
      state,
      pincode,
      careType,
      medicalConditions,
      specialNeeds,
      preferredGender,
      startDate,
      budget,
      additionalInfo,
      password
    } = req.body;

    console.log('Senior registration attempt:', { email, guardianName });

    // Check if senior already exists
    const seniorExists = await Senior.findOne({ email });

    if (seniorExists) {
      return res.status(400).json({ 
        success: false,
        message: 'Account with this email already exists' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ FIX: Structure address properly - handle both flat and nested formats
    const addressObj = {
      street: typeof address === 'string' ? address : (address?.street || ''),
      city: city || address?.city || '',
      state: state || address?.state || '',
      pincode: pincode || address?.pincode || ''
    };

    console.log('Creating senior with structured address:', addressObj);

    // Create senior/family account
    const senior = await Senior.create({
      guardianName,
      email,
      phone,
      relationship,
      seniorName,
      seniorAge: parseInt(seniorAge),
      address: addressObj,
      careType,
      medicalConditions,
      specialNeeds: specialNeeds || '',
      preferredGender: preferredGender || 'no-preference',
      startDate: new Date(startDate),
      budget: parseInt(budget),
      additionalInfo: additionalInfo || '',
      password: hashedPassword
    });

    console.log('✅ Senior created successfully:', senior._id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully! You can now search for caregivers and connect with them.',
      data: {
        id: senior._id,
        guardianName: senior.guardianName,
        email: senior.email,
        seniorName: senior.seniorName
      }
    });
  } catch (error) {
    console.error('❌ Senior registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error registering account: ' + error.message,
      error: error.message 
    });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    console.log('Login attempt:', { email, userType });

    if (!email || !password || !userType) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email, password, and user type' 
      });
    }

    // Find user based on type
    let user;
    let userModel;
    
    if (userType === 'caregiver') {
      user = await Caregiver.findOne({ email }).select('+password');
      userModel = 'Caregiver';
    } else if (userType === 'family') {
      user = await Senior.findOne({ email }).select('+password');
      userModel = 'Senior';
    } else {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid user type' 
      });
    }

    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password. Please check your credentials or register first.' 
      });
    }

    console.log('User found:', user.email);

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      console.log('Password mismatch');
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    console.log('Password matched');

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    user.password = undefined;

    console.log('Login successful for:', user.email);

    res.json({
      success: true,
      token,
      userType,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName || user.guardianName,
        phone: user.phone,
        verificationStatus: user.verificationStatus
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error logging in: ' + error.message,
      error: error.message 
    });
  }
};

// Get Current User
export const getCurrentUser = async (req, res) => {
  try {
    let user;
    
    // Try to find in both collections
    user = await Caregiver.findById(req.user.id);
    if (user) {
      return res.json({
        success: true,
        userType: 'caregiver',
        user
      });
    }

    user = await Senior.findById(req.user.id);
    if (user) {
      return res.json({
        success: true,
        userType: 'family',
        user
      });
    }

    res.status(404).json({ message: 'User not found' });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching user',
      error: error.message 
    });
  }
};