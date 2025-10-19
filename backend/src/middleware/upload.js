const path = require('path');
const multer = require('multer');
const { randomUUID } = require('crypto');

const config = require('../config/env');
const {
  VIDEO_MIME_TYPES,
  AUDIO_MIME_TYPES,
  IMAGE_MIME_TYPES,
} = require('../constants');
const { ApiError } = require('../utils/errors');

const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.webm', '.mkv'];
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.aac', '.webm'];
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];

const EXTENSION_MIME_OVERRIDES = {
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
  '.mkv': 'video/x-matroska',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.aac': 'audio/aac',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.storage.uploads),
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname) || '';
    const safeName = `${Date.now()}-${randomUUID()}${extension.toLowerCase()}`;
    cb(null, safeName);
  },
});

const buildUploader = (allowedMimes, allowedExtensions = []) => multer({
  storage,
  limits: {
    fileSize: config.uploadLimits.fileSize,
  },
  fileFilter: (req, file, cb) => {
    if (!allowedMimes || allowedMimes.includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    const extension = path.extname(file.originalname || '').toLowerCase();
    if (
      (file.mimetype === 'application/octet-stream' || !file.mimetype)
      && allowedExtensions.includes(extension)
    ) {
      if (EXTENSION_MIME_OVERRIDES[extension]) {
        // Normalise the mimetype so downstream logic treats the asset correctly.
        // eslint-disable-next-line no-param-reassign
        file.mimetype = EXTENSION_MIME_OVERRIDES[extension];
      }
      cb(null, true);
      return;
    }
    cb(new ApiError(400, `Unsupported file type ${file.mimetype || extension || 'unknown'}`));
  },
});

const uploadAny = buildUploader(
  [...VIDEO_MIME_TYPES, ...AUDIO_MIME_TYPES, ...IMAGE_MIME_TYPES],
  [...VIDEO_EXTENSIONS, ...AUDIO_EXTENSIONS, ...IMAGE_EXTENSIONS],
);
const uploadVideo = buildUploader(VIDEO_MIME_TYPES, VIDEO_EXTENSIONS);
const uploadAudio = buildUploader(AUDIO_MIME_TYPES, AUDIO_EXTENSIONS);
const uploadImage = buildUploader(IMAGE_MIME_TYPES, IMAGE_EXTENSIONS);

module.exports = {
  uploadAny,
  uploadVideo,
  uploadAudio,
  uploadImage,
};
