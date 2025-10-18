import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import caregiverRoutes from './routes/caregiverRoutes.js';
import seniorRoutes from './routes/seniorRoutes.js';
import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Health check route - MUST be before other routes
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    status: 'OK', 
    message: 'CareNest API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Welcome route
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Welcome to CareNest API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      caregivers: '/api/caregivers',
      seniors: '/api/seniors',
      bookings: '/api/bookings'
    }
  });
});

// API Routes - Make sure these come AFTER the root route
app.use('/api/auth', authRoutes);
app.use('/api/caregivers', caregiverRoutes);
app.use('/api/seniors', seniorRoutes);
app.use('/api/bookings', bookingRoutes);

// Test route to verify API is working
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API is working',
    availableRoutes: ['/api/auth', '/api/caregivers', '/api/seniors', '/api/bookings']
  });
});

// 404 handler - MUST be after all routes
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'route not found',
    path: req.path,
    method: req.method
  });
});

// Error handling middleware - MUST be last
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({ 
    success: false,
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || '*'}`);
});