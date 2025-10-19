import mongoose from 'mongoose';

const caregiverSchema = new mongoose.Schema({
  // Personal Information
  fullName: {
    type: String,
    required: [true, 'Please provide full name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Please provide phone number'],
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  profilePhoto: {
    type: String,
    default: null
  },
  
  // Address
  address: {
    street: String,
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true,
      match: [/^[0-9]{6}$/, 'Please provide a valid 6-digit pincode']
    }
  },
  
  // Document Verification (Critical for security)
  aadhaarNumber: {
    type: String,
    required: [true, 'Aadhaar number is required for verification'],
    unique: true,
    match: [/^[0-9]{12}$/, 'Please provide a valid 12-digit Aadhaar number']
  },
  panNumber: {
    type: String,
    required: [true, 'PAN number is required for verification'],
    unique: true,
    uppercase: true,
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please provide a valid PAN number']
  },
  aadhaarCard: {
    type: String, // File path
    required: true
  },
  panCard: {
    type: String, // File path
    required: true
  },
  // Approval & Verification Status
verificationStatus: {
  type: String,
  enum: ['pending', 'verified', 'rejected'],
  default: 'pending'
},
verificationDate: Date,

status: {
  type: String,
  enum: ['pending', 'approved', 'rejected', 'suspended'],
  default: 'pending'
},
isVerified: {
  type: Boolean,
  default: false
},
verifiedAt: {
  type: Date,
  default: null
},
registeredAt: {
  type: Date,
  default: Date.now
},
rejectionReason: {
  type: String,
  default: null
},
  
  // Professional Information
  experience: {
    type: Number,
    required: true,
    min: 0
  },
  education: {
    type: String,
    required: true
  },
  specializations: [{
    type: String,
    enum: [
      'Elderly Care',
      'Dementia Care',
      'Post-Surgery Care',
      'Mobility Assistance',
      'Medication Management',
      'Companionship',
      'Personal Care',
      'Meal Preparation'
    ]
  }],
  languages: [{
    type: String
  }],
  availability: {
    type: String,
    enum: ['full-time', 'part-time', 'live-in', 'flexible'],
    required: true
  },
  hourlyRate: {
    type: Number,
    required: true,
    min: 0
  },
  bio: {
    type: String,
    required: true,
    maxlength: 1000
  },
  certifications: [{
    type: String
  }],
  certificateFiles: [{
    type: String
  }],
  references: {
    type: String,
    maxlength: 500
  },
  
  // Rating and Reviews
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  
  // Statistics
  totalBookings: {
    type: Number,
    default: 0
  },
  completedBookings: {
    type: Number,
    default: 0
  },
  totalHoursWorked: {
    type: Number,
    default: 0
  },
  
  // Password
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
}, {
  timestamps: true
});

// Index for search optimization
caregiverSchema.index({ 'address.city': 1, specializations: 1, hourlyRate: 1 });
caregiverSchema.index({ verificationStatus: 1, isActive: 1 });

export default mongoose.model('Caregiver', caregiverSchema);