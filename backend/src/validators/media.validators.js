const { z } = require('zod');
const { EXPORT_FORMATS } = require('../constants');

const idSchema = z.string().min(1, 'id is required');

const trimSchema = z.object({
  start: z.number().nonnegative().default(0),
  end: z.number().nullable().optional(),
});

const filterSchema = z.object({
  filterType: z.string().min(1),
  brightness: z.number().optional(),
  contrast: z.number().optional(),
  saturation: z.number().optional(),
});

const textOverlaySchema = z.object({
  text: z.string().min(1),
  fontColor: z.string().optional(),
  fontSize: z.number().positive().optional(),
  x: z.string().optional(),
  y: z.string().optional(),
  box: z.boolean().optional(),
  boxColor: z.string().optional(),
  start: z.number().nonnegative().optional(),
  end: z.number().nonnegative().nullable().optional(),
});

const imageOverlaySchema = z.object({
  imageAssetId: idSchema,
  options: z.object({
    x: z.string().optional(),
    y: z.string().optional(),
    width: z.string().optional(),
    height: z.string().optional(),
    opacity: z.string().optional(),
    start: z.number().nonnegative().optional(),
    end: z.number().nonnegative().nullable().optional(),
  }).partial().optional(),
});

const replaceAudioSchema = z.object({
  audioAssetId: idSchema,
});

const mergeSchema = z.object({
  clipIds: z.array(idSchema).min(2, 'At least two clips are required'),
  format: z.enum(EXPORT_FORMATS).optional(),
});

const speedSchema = z.object({
  speed: z.number().positive().min(0.5, 'Minimum speed is 0.5x').max(2, 'Maximum speed is 2x'),
});

const exportSchema = z.object({
  assetId: idSchema,
  format: z.enum(EXPORT_FORMATS).optional(),
  resolution: z.string().optional(),
  operations: z.object({
    trim: trimSchema.partial().optional(),
    filter: filterSchema.partial().optional(),
    textOverlays: z.array(textOverlaySchema).optional(),
    imageOverlay: imageOverlaySchema.optional(),
    mute: z.boolean().optional(),
    replaceAudio: replaceAudioSchema.optional(),
  }).partial().optional(),
});

module.exports = {
  trimSchema,
  filterSchema,
  textOverlaySchema,
  imageOverlaySchema,
  replaceAudioSchema,
  mergeSchema,
  speedSchema,
  exportSchema,
};
