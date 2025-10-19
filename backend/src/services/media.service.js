const fs = require('fs/promises');
const path = require('path');

const config = require('../config/env');
const { ApiError } = require('../utils/errors');
const logger = require('../utils/logger');
const {
  addAsset,
  addGeneratedAsset,
  getAsset,
  getAbsolutePath,
  listAssets: listLibraryAssets,
  assetToDTO,
} = require('../storage/library');
const {
  trimVideo,
  applyFilter,
  addTextOverlay,
  addImageOverlay,
  muteVideo,
  replaceAudio,
  mergeVideos,
  transcodeVideo,
  changePlaybackSpeed,
} = require('./ffmpeg.service');
const { getVideoInfo } = require('./metadata.service');
const { EXPORT_FORMATS } = require('../constants');

const MIME_BY_EXTENSION = {
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
};

const guessMime = filePath => {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_BY_EXTENSION[ext] || 'application/octet-stream';
};

const getExtension = asset => path.extname(asset.filename) || '.mp4';
const buildDerivedName = (asset, suffix, extensionOverride) => {
  const base = asset.originalName.replace(/\.[^/.]+$/, '');
  const extension = extensionOverride || getExtension(asset);
  return `${base}-${suffix}${extension.startsWith('.') ? extension : `.${extension}`}`;
};

const enrichAsset = async dto => {
  if (dto.kind !== 'video') {
    return dto;
  }
  try {
    const absolutePath = path.join(config.storage.uploads, dto.filename);
    const videoInfo = await getVideoInfo(absolutePath);
    return { ...dto, metadata: videoInfo };
  } catch (error) {
    logger.warn('media-service', 'Failed to probe video metadata', { assetId: dto.id, error: error.message });
    return dto;
  }
};

const uploadSingle = async file => {
  const asset = await addAsset(file);
  return enrichAsset(asset);
};

const uploadMany = async files => {
  const uploads = await Promise.all(files.map(uploadSingle));
  return uploads;
};

const getAssetDetails = async id => {
  const asset = getAsset(id);
  return enrichAsset(assetToDTO(asset));
};

const ensureVideoAsset = id => {
  const asset = getAsset(id);
  if (asset.kind !== 'video') {
    throw new ApiError(400, `Asset ${id} is not a video`);
  }
  return asset;
};

const ensureImageAsset = id => {
  const asset = getAsset(id);
  if (asset.kind !== 'image') {
    throw new ApiError(400, `Asset ${id} is not an image`);
  }
  return asset;
};

const ensureAudioAsset = id => {
  const asset = getAsset(id);
  if (asset.kind !== 'audio') {
    throw new ApiError(400, `Asset ${id} is not an audio file`);
  }
  return asset;
};

const registerGenerated = async (absolutePath, sourceAsset, overrides = {}) => {
  const dto = await addGeneratedAsset({
    absolutePath,
    originalName: overrides.originalName || sourceAsset.originalName,
    mimetype: overrides.mimetype || sourceAsset.mimetype || guessMime(absolutePath),
    kind: overrides.kind || sourceAsset.kind,
  });
  return enrichAsset(dto);
};

const trimAsset = async (assetId, { start, end }) => {
  const asset = ensureVideoAsset(assetId);
  const sourcePath = getAbsolutePath(assetId);
  const trimmedPath = await trimVideo(sourcePath, { start, end });
  return registerGenerated(trimmedPath, asset, { originalName: buildDerivedName(asset, 'trimmed') });
};

const applyAssetFilter = async (assetId, filterPayload) => {
  const asset = ensureVideoAsset(assetId);
  const sourcePath = getAbsolutePath(assetId);
  const outputPath = await applyFilter(sourcePath, filterPayload);
  return registerGenerated(outputPath, asset, { originalName: buildDerivedName(asset, 'filtered') });
};

const addAssetText = async (assetId, overlayPayload) => {
  const asset = ensureVideoAsset(assetId);
  if (!overlayPayload.text) {
    throw new ApiError(400, 'Text overlay payload requires text');
  }
  const sourcePath = getAbsolutePath(assetId);
  const outputPath = await addTextOverlay(sourcePath, overlayPayload);
  return registerGenerated(outputPath, asset, { originalName: buildDerivedName(asset, 'text') });
};

const addAssetImage = async (assetId, imageAssetId, overlayPayload) => {
  const asset = ensureVideoAsset(assetId);
  const imageAsset = ensureImageAsset(imageAssetId);
  const sourcePath = getAbsolutePath(assetId);
  const overlayPath = getAbsolutePath(imageAssetId);
  const outputPath = await addImageOverlay(sourcePath, overlayPath, overlayPayload);
  return registerGenerated(outputPath, asset, { originalName: buildDerivedName(asset, 'overlay') });
};

const muteAssetAudio = async assetId => {
  const asset = ensureVideoAsset(assetId);
  const sourcePath = getAbsolutePath(assetId);
  const outputPath = await muteVideo(sourcePath);
  return registerGenerated(outputPath, asset, { originalName: buildDerivedName(asset, 'muted') });
};

const replaceAssetAudio = async (assetId, audioAssetId) => {
  const asset = ensureVideoAsset(assetId);
  const audioAsset = ensureAudioAsset(audioAssetId);
  const sourcePath = getAbsolutePath(assetId);
  const audioPath = getAbsolutePath(audioAssetId);
  const outputPath = await replaceAudio(sourcePath, audioPath);
  return registerGenerated(outputPath, asset, { originalName: buildDerivedName(asset, 'audio') });
};

const changeAssetSpeed = async (assetId, speed) => {
  const asset = ensureVideoAsset(assetId);
  if (Math.abs(speed - 1) < 0.001) {
    return enrichAsset(assetToDTO(asset));
  }
  const sourcePath = getAbsolutePath(assetId);
  const outputPath = await changePlaybackSpeed(sourcePath, speed);
  const suffix = speed > 1 ? `fast-${speed}` : `slow-${speed}`;
  return registerGenerated(outputPath, asset, {
    originalName: buildDerivedName(asset, suffix),
  });
};

const mergeAssetClips = async (clipIds, { format = 'mp4' } = {}) => {
  if (!clipIds || !clipIds.length) {
    throw new ApiError(400, 'clips array is required');
  }

  const assets = clipIds.map(id => ensureVideoAsset(id));
  const clipPaths = clipIds.map(id => getAbsolutePath(id));
  const outputPath = await mergeVideos(clipPaths, { format });
  return registerGenerated(outputPath, assets[0], {
    originalName: `merged-${Date.now()}.${format}`,
    mimetype: guessMime(outputPath),
  });
};

const exportAsset = async ({
  assetId,
  operations = {},
  format = null,
  resolution = 'original',
}) => {
  const asset = ensureVideoAsset(assetId);
  const originalFormat = path.extname(asset.filename).slice(1).toLowerCase() || 'mp4';
  const targetFormat = (format || originalFormat).toLowerCase();

  if (!EXPORT_FORMATS.includes(targetFormat)) {
    throw new ApiError(400, `Unsupported export format ${targetFormat}`);
  }

  let workingPath = getAbsolutePath(assetId);
  const cleanup = [];

  const runStep = async (fn, ...args) => {
    const resultPath = await fn(workingPath, ...args);
    if (workingPath !== getAbsolutePath(assetId)) {
      cleanup.push(workingPath);
    }
    workingPath = resultPath;
  };

  try {
    if (operations.trim) {
      await runStep(async (currentPath) => trimVideo(currentPath, operations.trim));
    }

    if (operations.filter) {
      await runStep(async (currentPath) => applyFilter(currentPath, operations.filter));
    }

    if (operations.textOverlays && Array.isArray(operations.textOverlays)) {
      for (const overlay of operations.textOverlays) {
        await runStep(async (currentPath) => addTextOverlay(currentPath, overlay));
      }
    }

    if (operations.imageOverlay && operations.imageOverlay.imageAssetId) {
      const overlayAsset = ensureImageAsset(operations.imageOverlay.imageAssetId);
      const overlayPath = getAbsolutePath(overlayAsset.id);
      await runStep(async (currentPath) => addImageOverlay(currentPath, overlayPath, operations.imageOverlay.options || {}));
    }

    if (operations.mute === true) {
      await runStep(async (currentPath) => muteVideo(currentPath));
    }

    if (operations.replaceAudio && operations.replaceAudio.audioAssetId) {
      const audioAsset = ensureAudioAsset(operations.replaceAudio.audioAssetId);
      const audioPath = getAbsolutePath(audioAsset.id);
      await runStep(async (currentPath) => replaceAudio(currentPath, audioPath));
    }

    if (targetFormat !== originalFormat || resolution !== 'original') {
      await runStep(async (currentPath) => transcodeVideo(currentPath, { format: targetFormat, resolution }));
    }

    if (workingPath === getAbsolutePath(assetId)) {
      // Nothing changed; reuse base asset metadata
      return enrichAsset(assetToDTO(asset));
    }

    const exported = await registerGenerated(workingPath, asset, {
      originalName: buildDerivedName(asset, 'export', targetFormat),
      mimetype: guessMime(workingPath),
    });

    return exported;
  } finally {
    await Promise.all(
      cleanup
        .filter(filePath => filePath !== workingPath)
        .map(filePath => fs.unlink(filePath).catch(() => {})),
    );
  }
};

const listAssetsWithMetadata = async () => {
  const assets = listLibraryAssets();
  const enriched = await Promise.all(assets.map(enrichAsset));
  return enriched.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
};

module.exports = {
  uploadSingle,
  uploadMany,
  listAssets: listAssetsWithMetadata,
  getAssetDetails,
  trimAsset,
  applyAssetFilter,
  addAssetText,
  addAssetImage,
  muteAssetAudio,
  replaceAssetAudio,
  changeAssetSpeed,
  mergeAssetClips,
  exportAsset,
};
