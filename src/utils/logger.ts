import winston from 'winston';
import path from 'path';

const levels = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };
const colors = { error: 'red', warn: 'yellow', info: 'green', http: 'magenta', debug: 'white' };

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
);

const transports: winston.transport[] = [
  new winston.transports.Console(),
];

// Hanya aktifkan File transport jika BUKAN di production
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  try {
    const logDir = path.join(__dirname, '../../logs');
    
    // Buat folder logs hanya di development
    const fs = require('fs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    transports.push(
      new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
      new winston.transports.File({ filename: path.join(logDir, 'all.log') })
    );
  } catch (error) {
    // Type narrowing untuk error yang tipenya 'unknown'
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String((error as any).message);
    }
    
    // Gunakan console.warn karena Logger mungkin belum siap
    console.warn('File logging disabled:', errorMessage);
  }
}

const Logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  levels,
  format,
  transports,
});

export default Logger;