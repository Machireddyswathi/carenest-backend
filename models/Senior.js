import mongoose from 'mongoose';

const seniorSchema = new mongoose.Schema({
  // Family Member/Guardian Information
  guardianName: {
    type: String,
    required: [true, 'Please provide guardian name'],
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
  relationship: {
    type: String,
    enum: ['son', 'daughter', 'spouse', 'sibling', 'relative', 'self'],
    required: true
  },
  
  // Senior Information
  seniorName: {
    type: String,
    required: [true, 'Please provide senior name'],
    trim: true
  },
  seniorAge: {
    type: Number,
    required: [true, 'Please provide senior age'],
    min: 50
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
  
  // Care Requirements
  careType: {
    type: String,
    enum: ['full-time', 'part-time', 'live-in', 'respite', 'overnight'],
    required: true
  },
  medicalConditions: {
    type: String,
    required: true
  },
  specialNeeds: String,
  preferredGender: {
    type: String,
    enum: ['male', 'female', 'no-preference'],
    default: 'no-preference'
  },
  startDate: {
    type: Date,
    required: true
  },
  budget: {
    type: Number,
    required: true,
    min: 0
  },
  additionalInfo: String,
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
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

export default mongoose.model('Senior', seniorSchema);