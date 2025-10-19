const VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-matroska',
];

const AUDIO_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/ogg',
  'audio/webm',
  'audio/aac',
];

const IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
];

const EXPORT_FORMATS = ['mp4', 'webm', 'mov'];

const RESOLUTION_FILTERS = {
  original: null,
  '480p': 'scale=-2:480',
  '720p': 'scale=-2:720',
  '1080p': 'scale=-2:1080',
};

const SPEED_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

const DEFAULT_TEXT_OVERLAY = {
  text: 'Sample Text',
  fontColor: 'white',
  fontSize: 36,
  x: '(w-text_w)/2',
  y: '(h-text_h)/2',
};

const DEFAULT_IMAGE_OVERLAY = {
  x: '10',
  y: '10',
  width: '',
  height: '',
  opacity: '1',
};

const FILTER_TYPES = ['brightness', 'contrast', 'saturation', 'grayscale', 'custom'];

const TASK_STATUSES = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETE: 'complete',
  FAILED: 'failed',
};

module.exports = {
  VIDEO_MIME_TYPES,
  AUDIO_MIME_TYPES,
  IMAGE_MIME_TYPES,
  EXPORT_FORMATS,
  RESOLUTION_FILTERS,
  SPEED_RATES,
  DEFAULT_TEXT_OVERLAY,
  DEFAULT_IMAGE_OVERLAY,
  FILTER_TYPES,
  TASK_STATUSES,
};
