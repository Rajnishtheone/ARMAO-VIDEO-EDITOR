const ffmpeg = require('fluent-ffmpeg');
const config = require('./env');

if (config.ffmpeg.ffmpegPath) {
  ffmpeg.setFfmpegPath(config.ffmpeg.ffmpegPath);
}

if (config.ffmpeg.ffprobePath) {
  ffmpeg.setFfprobePath(config.ffmpeg.ffprobePath);
}

module.exports = ffmpeg;
