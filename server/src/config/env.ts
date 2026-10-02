import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'smartcart_ai_default_secret_key_change_in_prod',
  jwtExpiresIn: '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  databasePath: process.env.DATABASE_PATH || (process.env.VERCEL ? '/tmp/smartcart.db' : './data/smartcart.db'),
  aiApiKey: process.env.AI_API_KEY || '',
};
