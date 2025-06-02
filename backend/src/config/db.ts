import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Load environment variables from project root .env
dotenv.config({ path: resolve(__dirname, '../../../.env') });

import mongoose from 'mongoose';
import Joi from 'joi';

// Валидация переменных окружения
const envSchema = Joi.object({
  MONGODB_URI: Joi.string().uri().required(),
  MONGODB_DB_NAME: Joi.string().required(),
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);
if (error) {
  throw new Error(`Ошибка валидации переменных окружения MongoDB: ${error.message}`);
}

const MONGODB_URI = envVars.MONGODB_URI;
const MONGODB_DB_NAME = envVars.MONGODB_DB_NAME;

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB_NAME,
    });
    // eslint-disable-next-line no-console
    console.log('MongoDB connected');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}; 