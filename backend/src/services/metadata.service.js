const ffmpeg = require('../config/ffmpeg');

const probeFile = filePath => new Promise((resolve, reject) => {
  ffmpeg.ffprobe(filePath, (error, metadata) => {
    if (error) {
      reject(error);
      return;
    }
    resolve(metadata);
  });
});

const getVideoInfo = async filePath => {
  const metadata = await probeFile(filePath);
  const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
  return {
    duration: Number(metadata.format.duration) || null,
    width: videoStream ? videoStream.width : null,
    height: videoStream ? videoStream.height : null,
    codec: videoStream ? videoStream.codec_name : null,
    frameRate: videoStream && videoStream.avg_frame_rate && videoStream.avg_frame_rate.includes('/')
      ? Number(videoStream.avg_frame_rate.split('/')[0]) / Number(videoStream.avg_frame_rate.split('/')[1])
      : null,
  };
};

module.exports = {
  probeFile,
  getVideoInfo,
};
