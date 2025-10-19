const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const projectRoot = path.resolve(__dirname, '..', '..');
const envFilePath = path.join(projectRoot, '.env');

if (fs.existsSync(envFilePath)) {
  dotenv.config({ path: envFilePath });
} else {
  dotenv.config();
}

const resolveDir = (maybePath, fallback) => {
  if (maybePath && path.isAbsolute(maybePath)) {
    return maybePath;
  }
  if (maybePath) {
    return path.resolve(projectRoot, maybePath);
  }
  return path.resolve(projectRoot, fallback);
};

const storageRoot = resolveDir(process.env.STORAGE_ROOT, 'storage');
const uploadDir = path.join(storageRoot, 'uploads');
const tempDir = path.join(storageRoot, 'tmp');

[storageRoot, uploadDir, tempDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction: (process.env.NODE_ENV || '').toLowerCase() === 'production',
  port: Number(process.env.PORT || 5000),
  storage: {
    root: storageRoot,
    uploads: uploadDir,
    temp: tempDir,
  },
  ffmpeg: {
    ffmpegPath: process.env.FFMPEG_PATH || 'ffmpeg',
    ffprobePath: process.env.FFPROBE_PATH || 'ffprobe',
  },
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(v => v.trim()) : undefined,
  },
  uploadLimits: {
    fileSize: Number(process.env.MAX_UPLOAD_SIZE_BYTES || 1024 * 1024 * 1024), // default 1GB
  },
};

module.exports = config;
