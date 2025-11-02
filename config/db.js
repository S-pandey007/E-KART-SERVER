import dotenv from 'dotenv'
import mongoose from 'mongoose';
import debug from 'debug';
import { seedData } from '../seedScript.js';
dotenv.config()
const dbLog = debug('app:db');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    dbLog(`MongoDB connected: ${conn.connection.host}`);
    // seedData();
  } catch (error) {
    dbLog(`MongoDB connection error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
