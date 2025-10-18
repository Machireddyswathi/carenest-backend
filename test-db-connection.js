import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ MongoDB Connected Successfully!');
    console.log('📍 Host:', mongoose.connection.host);
    console.log('📊 Database:', mongoose.connection.name);
    
    // Close connection
    await mongoose.connection.close();
    console.log('🔒 Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection Failed:', error.message);
    process.exit(1);
  }
};

testConnection();