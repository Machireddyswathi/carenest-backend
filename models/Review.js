import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
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
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  
  // Review Content
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Please provide a comment'],
    maxlength: 500
  },
  
  // Response from Caregiver (optional)
  caregiverResponse: {
    type: String,
    maxlength: 500
  },
  responseDate: Date,
  
  // Visibility
  isVisible: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Prevent duplicate reviews for same booking
reviewSchema.index({ booking: 1 }, { unique: true });

// Update caregiver rating after review is saved
reviewSchema.post('save', async function() {
  const Caregiver = mongoose.model('Caregiver');
  const Review = mongoose.model('Review');
  
  const stats = await Review.aggregate([
    { $match: { caregiver: this.caregiver } },
    {
      $group: {
        _id: '$caregiver',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);
  
  if (stats.length > 0) {
    await Caregiver.findByIdAndUpdate(this.caregiver, {
      rating: stats[0].averageRating,
      reviewCount: stats[0].reviewCount
    });
  }
});

export default mongoose.model('Review', reviewSchema);