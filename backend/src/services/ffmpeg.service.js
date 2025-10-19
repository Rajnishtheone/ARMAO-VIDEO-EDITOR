const fs = require('fs/promises');
const path = require('path');
const os = require('os');
const { randomUUID } = require('crypto');

const config = require('../config/env');
const ffmpeg = require('../config/ffmpeg');
const { RESOLUTION_FILTERS } = require('../constants');

const buildOutputPath = (extension = '.mp4') => {
  const ext = extension.startsWith('.') ? extension : `.${extension}`;
  return path.join(config.storage.uploads, `${Date.now()}-${randomUUID()}${ext}`);
};

const runFfmpeg = (command, outputPath) => new Promise((resolve, reject) => {
  command
    .on('error', reject)
    .on('end', () => resolve(outputPath))
    .save(outputPath);
});

const escapeText = text => text
  .replace(/\\/g, '\\\\')
  .replace(/'/g, "\\'")
  .replace(/:/g, '\\:')
  .replace(/%/g, '\\%')
  .replace(/,/g, '\\,');

const trimVideo = async (sourcePath, { start = 0, end = null }) => {
  const ext = path.extname(sourcePath) || '.mp4';
  const outputPath = buildOutputPath(ext);
  const duration = end !== null && end >= start ? end - start : null;

  const command = ffmpeg(sourcePath)
    .outputOptions('-movflags', 'faststart');

  if (start) {
    command.setStartTime(start);
  }
  if (duration && duration > 0) {
    command.setDuration(duration);
  }

  return runFfmpeg(command, outputPath);
};

const applyFilter = async (sourcePath, filterConfig) => {
  const { filterType, brightness = 0, contrast = 1, saturation = 1 } = filterConfig;
  let expression = '';
  if (filterType === 'grayscale') expression = 'hue=s=0';
  if (filterType === 'brightness') expression = `eq=brightness=${brightness}`;
  if (filterType === 'contrast') expression = `eq=contrast=${contrast}`;
  if (filterType === 'saturation') expression = `eq=saturation=${saturation}`;
  if (filterType === 'custom' || !expression) {
    expression = `eq=brightness=${brightness}:contrast=${contrast}:saturation=${saturation}`;
  }

  const ext = path.extname(sourcePath) || '.mp4';
  const outputPath = buildOutputPath(ext);
  const command = ffmpeg(sourcePath)
    .videoFilters(expression)
    .outputOptions('-movflags', 'faststart');

  return runFfmpeg(command, outputPath);
};

const addTextOverlay = async (sourcePath, overlay) => {
  const {
    text,
    fontColor = 'white',
    fontSize = 36,
    x = '(w-text_w)/2',
    y = '(h-text_h)/2',
    box = false,
    boxColor = 'black@0.5',
    start = 0,
    end = null,
  } = overlay;

  const escapedText = escapeText(text || '');
  let drawtext = `drawtext=text='${escapedText}':fontcolor=${fontColor}:fontsize=${fontSize}:x=${x}:y=${y}`;
  if (box) {
    drawtext += `:box=1:boxcolor=${boxColor}`;
  }
  if (end !== null) {
    drawtext += `:enable='between(t,${start},${end})'`;
  } else if (start > 0) {
    drawtext += `:enable='gte(t,${start})'`;
  }

  const ext = path.extname(sourcePath) || '.mp4';
  const outputPath = buildOutputPath(ext);

  const command = ffmpeg(sourcePath)
    .videoFilters(drawtext)
    .outputOptions('-movflags', 'faststart');

  return runFfmpeg(command, outputPath);
};

const addImageOverlay = async (videoPath, imagePath, overlay = {}) => {
  const {
    x = '10',
    y = '10',
    width = '',
    height = '',
    opacity = '',
    start = null,
    end = null,
  } = overlay;

  const useOpacity = opacity !== '' && !Number.isNaN(Number(opacity));
  const filters = [];
  let overlayInputLabel = '1:v';

  if (width || height || useOpacity) {
    const scaleWidth = width || '-1';
    const scaleHeight = height || '-1';
    const parts = [`[1:v] scale=${scaleWidth}:${scaleHeight}`];
    if (useOpacity) {
      parts.push('format=rgba');
      parts.push(`colorchannelmixer=aa=${Number(opacity).toFixed(2)}`);
    }
    filters.push(`${parts.join(',')} [logo]`);
    overlayInputLabel = 'logo';
  }

  let overlayFilter = `[0:v][${overlayInputLabel}] overlay=${x}:${y}`;
  if (start !== null || end !== null) {
    const begin = start ?? 0;
    const finish = end ?? 'N';
    overlayFilter += `:enable='between(t,${begin},${finish})'`;
  }
  overlayFilter += ' [outv]';
  filters.push(overlayFilter);

  const ext = path.extname(videoPath) || '.mp4';
  const outputPath = buildOutputPath(ext);

  const command = ffmpeg()
    .input(videoPath)
    .input(imagePath)
    .complexFilter(filters, ['outv'])
    .outputOptions('-movflags', 'faststart');

  return runFfmpeg(command, outputPath);
};

const muteVideo = async sourcePath => {
  const ext = path.extname(sourcePath) || '.mp4';
  const outputPath = buildOutputPath(ext);
  const command = ffmpeg(sourcePath)
    .noAudio()
    .outputOptions('-movflags', 'faststart');
  return runFfmpeg(command, outputPath);
};

const replaceAudio = async (videoPath, audioPath) => {
  const ext = path.extname(videoPath) || '.mp4';
  const outputPath = buildOutputPath(ext);
  const command = ffmpeg()
    .input(videoPath)
    .input(audioPath)
    .outputOptions([
      '-map 0:v:0',
      '-map 1:a:0',
      '-c:v copy',
      '-shortest',
      '-movflags faststart',
    ]);
  return runFfmpeg(command, outputPath);
};

const mergeVideos = async (clipPaths, { format = 'mp4' } = {}) => {
  if (!clipPaths.length) {
    throw new Error('No clips provided for merge');
  }

  const fileListPath = path.join(os.tmpdir(), `armao-merge-${randomUUID()}.txt`);
  const listContents = clipPaths
    .map(clipPath => `file '${clipPath.replace(/\\/g, '/')}'`)
    .join('\n');
  await fs.writeFile(fileListPath, listContents, 'utf-8');

  const outputPath = buildOutputPath(format);

  try {
    const command = ffmpeg()
      .input(fileListPath)
      .inputOptions(['-f', 'concat', '-safe', '0'])
      .outputOptions(['-c', 'copy', '-movflags', 'faststart']);

    return await runFfmpeg(command, outputPath);
  } finally {
    await fs.unlink(fileListPath).catch(() => {});
  }
};

const transcodeVideo = async (sourcePath, { format = 'mp4', resolution = 'original' } = {}) => {
  const filter = RESOLUTION_FILTERS[resolution] || null;
  const outputPath = buildOutputPath(format);
  const command = ffmpeg(sourcePath);

  if (filter) {
    command.videoFilters(filter);
  }

  if (format === 'webm') {
    command.outputOptions(['-c:v', 'libvpx-vp9', '-b:v', '2M', '-c:a', 'libopus']);
  } else if (format === 'mov') {
    command.outputOptions(['-c:v', 'prores_ks', '-profile:v', '3']);
  } else {
    command.outputOptions(['-c:v', 'libx264', '-preset', 'medium', '-crf', '22', '-c:a', 'aac']);
  }

  command.outputOptions('-movflags', 'faststart');
  return runFfmpeg(command, outputPath);
};

const changePlaybackSpeed = async (sourcePath, speed) => {
  const ext = path.extname(sourcePath) || '.mp4';
  const outputPath = buildOutputPath(ext);
  const videoFilter = `setpts=${(1 / speed).toFixed(6)}*PTS`;
  const command = ffmpeg(sourcePath)
    .videoFilters(videoFilter)
    .outputOptions('-movflags', 'faststart');

  if (speed > 0) {
    command.audioFilters(`atempo=${Number(speed).toFixed(3)}`);
  }

  return runFfmpeg(command, outputPath);
};

module.exports = {
  buildOutputPath,
  trimVideo,
  applyFilter,
  addTextOverlay,
  addImageOverlay,
  muteVideo,
  replaceAudio,
  mergeVideos,
  transcodeVideo,
  changePlaybackSpeed,
};
