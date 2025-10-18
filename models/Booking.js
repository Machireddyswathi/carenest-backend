import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  caregiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Caregiver',
    required: true
  },
  senior: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Senior',
    required: true
  },
  
  // Booking Details
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  
  // Location
  serviceLocation: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Payment
  hourlyRate: {
    type: Number,
    required: true
  },
  totalHours: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentDate: Date,
  
  // Notes
  specialInstructions: String,
  caregiverNotes: String,
  
  // Review
  reviewed: {
    type: Boolean,
    default: false
  },
  
  // Cancellation
  cancelledBy: {
    type: String,
    enum: ['caregiver', 'senior', 'admin'],
    default: null
  },
  cancellationReason: String,
  cancellationDate: Date
}, {
  timestamps: true
});

// Calculate total amount before saving
bookingSchema.pre('save', function(next) {
  this.totalAmount = this.hourlyRate * this.totalHours;
  next();
});

export default mongoose.model('Booking', bookingSchema);