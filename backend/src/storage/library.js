const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { randomUUID } = require('crypto');

const config = require('../config/env');
const {
  VIDEO_MIME_TYPES,
  AUDIO_MIME_TYPES,
  IMAGE_MIME_TYPES,
} = require('../constants');
const { ApiError } = require('../utils/errors');
const logger = require('../utils/logger');

const libraryFile = path.join(config.storage.root, 'library.json');

const index = new Map();
let initialized = false;

const detectKind = mimetype => {
  if (VIDEO_MIME_TYPES.includes(mimetype)) return 'video';
  if (AUDIO_MIME_TYPES.includes(mimetype)) return 'audio';
  if (IMAGE_MIME_TYPES.includes(mimetype)) return 'image';
  return 'binary';
};

const persist = async () => {
  const data = JSON.stringify(
    Array.from(index.values()),
    null,
    2,
  );
  await fsp.writeFile(libraryFile, data, 'utf-8');
};

const initLibrary = async () => {
  if (initialized) return;
  try {
    if (fs.existsSync(libraryFile)) {
      const raw = await fsp.readFile(libraryFile, 'utf-8');
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.forEach(item => index.set(item.id, item));
      }
    } else {
      await persist();
    }
    initialized = true;
    logger.info('library', 'Media library initialised', { size: index.size });
  } catch (error) {
    logger.error('library', 'Failed to initialise media library', error);
    throw error;
  }
};

const assetToDTO = asset => ({
  id: asset.id,
  originalName: asset.originalName,
  filename: asset.filename,
  mimetype: asset.mimetype,
  size: asset.size,
  kind: asset.kind,
  createdAt: asset.createdAt,
  updatedAt: asset.updatedAt,
  url: `/media/files/${asset.filename}`,
});

const buildAssetDTO = asset => ({
  id: asset.id,
  originalName: asset.originalName,
  filename: asset.filename,
  mimetype: asset.mimetype,
  size: asset.size,
  kind: asset.kind,
  createdAt: asset.createdAt,
  updatedAt: asset.updatedAt,
  url: `/media/files/${asset.filename}`,
});

const addAsset = async file => {
  const asset = {
    id: randomUUID(),
    originalName: file.originalname,
    filename: file.filename,
    mimetype: file.mimetype,
    size: file.size,
    kind: detectKind(file.mimetype),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  index.set(asset.id, asset);
  await persist();
  return buildAssetDTO(asset);
};

const getAsset = id => {
  const asset = index.get(id);
  if (!asset) {
    throw new ApiError(404, `Asset ${id} not found`);
  }
  return asset;
};

const updateAsset = async (id, patch) => {
  const asset = getAsset(id);
  const updated = {
    ...asset,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  index.set(id, updated);
  await persist();
  return buildAssetDTO(updated);
};

const removeAsset = async (id, { deleteFile = true } = {}) => {
  const asset = getAsset(id);
  index.delete(id);
  await persist();
  if (deleteFile) {
    const absolutePath = path.join(config.storage.uploads, asset.filename);
    if (fs.existsSync(absolutePath)) {
      await fsp.unlink(absolutePath);
    }
  }
  return buildAssetDTO(asset);
};

const listAssets = () => Array.from(index.values()).map(buildAssetDTO);

const getAbsolutePath = id => {
  const asset = getAsset(id);
  return path.join(config.storage.uploads, asset.filename);
};

const addGeneratedAsset = async ({ absolutePath, originalName, mimetype, kind }) => {
  const filename = path.basename(absolutePath);
  const stats = await fsp.stat(absolutePath);
  const asset = {
    id: randomUUID(),
    originalName: originalName || filename,
    filename,
    mimetype,
    size: stats.size,
    kind: kind || detectKind(mimetype),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  index.set(asset.id, asset);
  await persist();
  return buildAssetDTO(asset);
};

module.exports = {
  initLibrary,
  addAsset,
  addGeneratedAsset,
  getAsset,
  updateAsset,
  removeAsset,
  listAssets,
  getAbsolutePath,
  assetToDTO: buildAssetDTO,
};
