const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const os = require('os');

const router = express.Router();

const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

router.post('/merge', upload.array('videos', 10), async (req, res) => {
  try {
    console.log('Received files:', req.files.map(f => f.filename));
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ error: 'No videos uploaded' });

    const exportFormat = req.body.exportFormat || 'mp4';
    const mergedFilename = `${Date.now()}-merged.${exportFormat}`;
    const outputPath = path.join(uploadDir, mergedFilename);

    const fileListPath = path.join(os.tmpdir(), `filelist-${Date.now()}.txt`);
    const listContent = req.files
      .map(f => `file '${path.resolve(f.path).replace(/\\/g, '/')}'`)
      .join('\n');
    fs.writeFileSync(fileListPath, listContent);

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(fileListPath)
        .inputOptions(['-f', 'concat', '-safe', '0'])
        .outputOptions(['-c', 'copy'])
        .save(outputPath)
        .on('end', resolve)
        .on('error', reject);
    });

    res.download(outputPath, mergedFilename, err => {
      req.files.forEach(f => fs.existsSync(f.path) && fs.unlinkSync(f.path));
      fs.existsSync(fileListPath) && fs.unlinkSync(fileListPath);
      fs.existsSync(outputPath) && fs.unlinkSync(outputPath);
      if (err) console.error('Error sending file:', err);
    });
  } catch (err) {
    console.error('Merge error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
