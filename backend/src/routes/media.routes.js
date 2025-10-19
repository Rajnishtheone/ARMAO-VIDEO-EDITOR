const express = require('express');

const asyncHandler = require('../middleware/asyncHandler');
const { validateBody } = require('../middleware/validate');
const {
  uploadAny,
} = require('../middleware/upload');
const mediaController = require('../controllers/media.controller');
const {
  trimSchema,
  filterSchema,
  textOverlaySchema,
  imageOverlaySchema,
  replaceAudioSchema,
  mergeSchema,
  speedSchema,
  exportSchema,
} = require('../validators/media.validators');

const router = express.Router();

router.post(
  '/assets',
  uploadAny.single('file'),
  asyncHandler(mediaController.uploadAsset),
);

router.post(
  '/assets/batch',
  uploadAny.array('files', 10),
  asyncHandler(mediaController.uploadAssetsBatch),
);

router.get(
  '/assets',
  asyncHandler(mediaController.listAssetMetadata),
);

router.get(
  '/assets/:assetId',
  asyncHandler(mediaController.getAssetMetadata),
);

router.get(
  '/assets/:assetId/download',
  asyncHandler(mediaController.downloadAsset),
);

router.get(
  '/assets/:assetId/stream',
  asyncHandler(mediaController.streamAsset),
);

router.post(
  '/assets/:assetId/trim',
  validateBody(trimSchema),
  asyncHandler(mediaController.trimVideo),
);

router.post(
  '/assets/:assetId/filter',
  validateBody(filterSchema),
  asyncHandler(mediaController.applyFilter),
);

router.post(
  '/assets/:assetId/text-overlays',
  validateBody(textOverlaySchema),
  asyncHandler(mediaController.addTextOverlay),
);

router.post(
  '/assets/:assetId/image-overlays',
  validateBody(imageOverlaySchema),
  asyncHandler(mediaController.addImageOverlay),
);

router.post(
  '/assets/:assetId/audio/mute',
  asyncHandler(mediaController.muteAudio),
);

router.post(
  '/assets/:assetId/audio/replace',
  validateBody(replaceAudioSchema),
  asyncHandler(mediaController.replaceAudio),
);

router.post(
  '/assets/:assetId/speed',
  validateBody(speedSchema),
  asyncHandler(mediaController.changeSpeed),
);

router.post(
  '/actions/merge',
  validateBody(mergeSchema),
  asyncHandler(mediaController.mergeVideos),
);

router.post(
  '/actions/export',
  validateBody(exportSchema),
  asyncHandler(mediaController.exportVideo),
);

module.exports = router;
