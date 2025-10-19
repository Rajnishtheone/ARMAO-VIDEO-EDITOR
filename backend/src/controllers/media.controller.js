const path = require('path');

const mediaService = require('../services/media.service');
const { getAsset, getAbsolutePath } = require('../storage/library');
const { ApiError } = require('../utils/errors');

const uploadAsset = async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No file provided');
  }
  const asset = await mediaService.uploadSingle(req.file);
  res.status(201).json({ asset });
};

const uploadAssetsBatch = async (req, res) => {
  if (!req.files || !req.files.length) {
    throw new ApiError(400, 'No files provided');
  }
  const assets = await mediaService.uploadMany(req.files);
  res.status(201).json({ assets });
};

const listAssetMetadata = async (req, res) => {
  const assets = await mediaService.listAssets();
  res.json({ assets });
};

const getAssetMetadata = async (req, res) => {
  const asset = await mediaService.getAssetDetails(req.params.assetId);
  res.json({ asset });
};

const trimVideo = async (req, res) => {
  const asset = await mediaService.trimAsset(req.params.assetId, req.validated.body);
  res.status(201).json({ asset });
};

const applyFilter = async (req, res) => {
  const asset = await mediaService.applyAssetFilter(req.params.assetId, req.validated.body);
  res.status(201).json({ asset });
};

const addTextOverlay = async (req, res) => {
  const asset = await mediaService.addAssetText(req.params.assetId, req.validated.body);
  res.status(201).json({ asset });
};

const addImageOverlay = async (req, res) => {
  const asset = await mediaService.addAssetImage(
    req.params.assetId,
    req.validated.body.imageAssetId,
    req.validated.body.options || {},
  );
  res.status(201).json({ asset });
};

const muteAudio = async (req, res) => {
  const asset = await mediaService.muteAssetAudio(req.params.assetId);
  res.status(201).json({ asset });
};

const replaceAudio = async (req, res) => {
  const asset = await mediaService.replaceAssetAudio(
    req.params.assetId,
    req.validated.body.audioAssetId,
  );
  res.status(201).json({ asset });
};

const mergeVideos = async (req, res) => {
  const asset = await mediaService.mergeAssetClips(req.validated.body.clipIds, {
    format: req.validated.body.format,
  });
  res.status(201).json({ asset });
};

const changeSpeed = async (req, res) => {
  const asset = await mediaService.changeAssetSpeed(
    req.params.assetId,
    req.validated.body.speed,
  );
  res.status(201).json({ asset });
};

const exportVideo = async (req, res) => {
  const asset = await mediaService.exportAsset({
    assetId: req.validated.body.assetId,
    operations: req.validated.body.operations,
    format: req.validated.body.format,
    resolution: req.validated.body.resolution,
  });
  res.status(201).json({ asset });
};

const downloadAsset = async (req, res) => {
  const asset = getAsset(req.params.assetId);
  const absolutePath = getAbsolutePath(asset.id);
  res.download(absolutePath, asset.originalName);
};

const streamAsset = async (req, res) => {
  const asset = getAsset(req.params.assetId);
  const absolutePath = getAbsolutePath(asset.id);
  res.sendFile(path.resolve(absolutePath));
};

module.exports = {
  uploadAsset,
  uploadAssetsBatch,
  listAssetMetadata,
  getAssetMetadata,
  trimVideo,
  applyFilter,
  addTextOverlay,
  addImageOverlay,
  muteAudio,
  replaceAudio,
  mergeVideos,
  changeSpeed,
  exportVideo,
  downloadAsset,
  streamAsset,
};
