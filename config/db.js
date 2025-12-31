import dotenv from "dotenv";
import mongoose from "mongoose";
import { seedData, seedInfulancerData } from "../seedScript.js";
import logger from "./logger.js";
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
    // seedData();
    // seedInfulancerData();
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
