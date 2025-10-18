const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Video filter (brightness, contrast, etc.)
router.post('/filter', upload.single('video'), (req, res) => {
  const inputPath = req.file.path;
  const outputPath = path.join('uploads', `${Date.now()}-filtered.mp4`);
  const { brightness = 0, contrast = 1, saturation = 1, filterType = 'brightness' } = req.body;
  let filter = '';
  if (filterType === 'grayscale') filter = 'hue=s=0';
  if (filterType === 'brightness') filter = `eq=brightness=${brightness}`;
  if (filterType === 'contrast') filter = `eq=contrast=${contrast}`;
  if (filterType === 'saturation') filter = `eq=saturation=${saturation}`;
  if (filterType === 'custom') filter = `eq=brightness=${brightness}:contrast=${contrast}:saturation=${saturation}`;

  ffmpeg(inputPath)
    .videoFilters(filter)
    .outputOptions('-movflags', 'faststart')
    .output(outputPath)
    .on('end', () => {
      res.download(outputPath, () => {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });
    })
    .on('error', err => {
      res.status(500).json({ error: err.message });
      fs.unlinkSync(inputPath);
    })
    .run();
});

// Text overlay
router.post('/overlay/text', upload.single('video'), (req, res) => {
  const inputPath = req.file.path;
  const outputPath = path.join('uploads', `${Date.now()}-overlay.mp4`);
  const { text = 'Sample Text', fontSize = 36, fontColor = 'white', x = '(w-text_w)/2', y = '(h-text_h)-20' } = req.body;
  const drawtext = `drawtext=text='${text}':fontcolor=${fontColor}:fontsize=${fontSize}:x=${x}:y=${y}`;
  ffmpeg(inputPath)
    .videoFilters(drawtext)
    .outputOptions('-movflags', 'faststart')
    .output(outputPath)
    .on('end', () => {
      res.download(outputPath, () => {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });
    })
    .on('error', err => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      res.status(500).json({ error: err.message });
    })
    .run();
});

// Image overlay (logo/watermark)
const { v4: uuidv4 } = require('uuid');

router.post('/overlay/image', upload.fields([{ name: 'video' }, { name: 'image' }]), (req, res) => {
  try {
    // Basic checks
    if (!req.files || !req.files.video || !req.files.image) {
      return res.status(400).json({ error: 'Video and image files are required' });
    }

    // Resolve absolute paths (important on Windows)
    const inputPath = path.resolve(req.files.video[0].path);
    const imagePath = path.resolve(req.files.image[0].path);
    const outputPath = path.resolve('uploads', `${Date.now()}-img-overlay-${uuidv4()}.mp4`);

    // Read positioning/size params from the request body
    // x/y can be plain numbers (px) or FFmpeg expressions (e.g. "main_w-overlay_w-10" or "(main_w-overlay_w)/2")
    // width/height can be numbers (px) or FFmpeg expressions; if one is omitted, we use -1 to preserve aspect ratio
    let { x = '10', y = '10', width = '', height = '', opacity = '' } = req.body;

    // Helper: is numeric value
    const isNumber = v => v !== '' && !Number.isNaN(Number(v));

    // Build filter chain:
    // If width/height provided, scale the overlay image first, label it [logo], then overlay [logo] onto main video.
    // Otherwise overlay original image stream [1:v] onto [0:v].
    const filters = [];
    if (width || height) {
      const scaleW = isNumber(width) ? String(Number(width)) : (width || '-1');
      const scaleH = isNumber(height) ? String(Number(height)) : (height || '-1');
      // If opacity provided (0..1), apply to the logo via colorchannelmixer after scale
      if (opacity && !Number.isNaN(Number(opacity))) {
        // ensure the overlay has an alpha channel and adjust alpha
        // colorchannelmixer's 'aa' controls alpha multiplier
        filters.push(`[1:v] scale=${scaleW}:${scaleH}, format=rgba, colorchannelmixer=aa=${Number(opacity).toFixed(2)} [logo]`);
      } else {
        filters.push(`[1:v] scale=${scaleW}:${scaleH} [logo]`);
      }
      filters.push(`[0:v][logo] overlay=${x}:${y}`);
    } else {
      // no scale requested; maybe opacity requested
      if (opacity && !Number.isNaN(Number(opacity))) {
        filters.push(`[1:v] format=rgba, colorchannelmixer=aa=${Number(opacity).toFixed(2)} [logo]`);
        filters.push(`[0:v][logo] overlay=${x}:${y}`);
      } else {
        filters.push(`[0:v][1:v] overlay=${x}:${y}`);
      }
    }

    // Run ffmpeg
    ffmpeg()
      .input(inputPath)
      .input(imagePath)
      .complexFilter(filters)
      .outputOptions(['-movflags', 'faststart'])
      .output(outputPath)
      .on('stderr', line => console.log('FFmpeg stderr:', line))
      .on('end', () => {
        res.download(outputPath, () => {
          // safe cleanup
          [inputPath, imagePath, outputPath].forEach(p => {
            try { if (fs.existsSync(p)) fs.unlinkSync(p); } catch (e) { console.warn('cleanup error', p, e); }
          });
        });
      })
      .on('error', err => {
        console.error('FFmpeg error:', err);
        // cleanup uploaded inputs (output may not exist or be partial)
        [inputPath, imagePath].forEach(p => { try { if (fs.existsSync(p)) fs.unlinkSync(p); } catch(e){} });
        res.status(500).json({ error: err.message });
      })
      .run();

  } catch (err) {
    console.error('Route error:', err);
    res.status(500).json({ error: err.message });
  }
});

// router.post('/overlay/image', upload.fields([{ name: 'video' }, { name: 'image' }]), (req, res) => {
//   const inputPath = req.files['video'][0].path;
//   const imagePath = req.files['image'][0].path;
//   const outputPath = path.join('uploads', `${Date.now()}-img-overlay.mp4`);
//   ffmpeg(inputPath)
//     .input(imagePath)
//     .complexFilter(['[0:v][1:v] overlay=10:10'])
//     .outputOptions('-movflags', 'faststart')
//     .output(outputPath)
//     .on('end', () => {
//       res.download(outputPath, () => {
//         fs.unlinkSync(inputPath);
//         fs.unlinkSync(imagePath);
//         fs.unlinkSync(outputPath);
//       });
//     })
//     .on('error', err => {
//       res.status(500).json({ error: err.message });
//       fs.unlinkSync(inputPath);
//       fs.unlinkSync(imagePath);
//     })
//     .run();
// });

// Mute video
router.post('/audio/mute', upload.single('video'), (req, res) => {
  const inputPath = req.file.path;
  const outputPath = path.join('uploads', `${Date.now()}-muted.mp4`);
  ffmpeg(inputPath)
    .noAudio()
    .outputOptions('-movflags', 'faststart')
    .output(outputPath)
    .on('end', () => {
      res.download(outputPath, () => {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });
    })
    .on('error', err => {
      res.status(500).json({ error: err.message });
      fs.unlinkSync(inputPath);
    })
    .run();
});

// Replace audio
router.post('/audio/replace', upload.fields([{ name: 'video' }, { name: 'audio' }]), (req, res) => {
  // console.log("Files: ", req.files);
  // console.log("Video file: ", req.files?.video?.[0]);
  // console.log("Audio file: ", req.files?.audio?.[0]);

  if (!req.files?.video || !req.files?.audio) {
    return res.status(400).json({ error: 'Both video and audio files are required' });
  }

  const inputPath = path.resolve(req.files['video'][0].path);
  const audioPath = path.resolve(req.files['audio'][0].path);
  const outputPath = path.resolve('uploads', `${Date.now()}-replaced-audio.mp4`);
  ffmpeg()
    .input(inputPath)
    .input(audioPath)
    .outputOptions(['-map 0:v:0', '-map 1:a:0', '-c:v copy', '-shortest', '-movflags faststart'])
    .output(outputPath)
    .on('end', () => {
      res.download(outputPath, () => {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(audioPath);
        fs.unlinkSync(outputPath);
      });
    })
    .on('stderr', (stderrLine) => {
      console.error('FFmpeg stderr:', stderrLine);
    })
    .on('error', err => {
      res.status(500).json({ error: err.message });
      fs.unlinkSync(inputPath);
      fs.unlinkSync(audioPath);
    })
    .run();
});

// Merge videos with trim, order, fade, speed, export format/resolution

// router.post('/merge', upload.array('videos', 10), (req, res) => { 
//   try {
//     console.log('Received files:', req.files);

//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ error: 'No files uploaded' });
//     }

//     // Ensure uploads dir exists
//     const uploadDir = path.resolve('uploads');
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }

//     // Normalize input file paths
//     const filePaths = req.files.map(f => path.resolve(f.path).replace(/\\/g, '/'));

//     const exportFormat = req.body.exportFormat || 'mp4';
//     const exportResolution = req.body.exportResolution || 'original';
//     const outputPath = path.resolve(uploadDir, `${Date.now()}-merged.${exportFormat}`).replace(/\\/g, '/');
//     console.log('FFmpeg writing to:', outputPath);

//     const order = req.body.order ? JSON.parse(req.body.order) : filePaths.map((_, i) => i);

//     // Prepare clip objects
//     const clips = order.map(idx => {
//       const start = Number(req.body[`start_${idx}`] || 0);
//       const end = req.body[`end_${idx}`] ? Number(req.body[`end_${idx}`]) : null;
//       const fadeIn = req.body[`fadeIn_${idx}`] === 'true';
//       const fadeOut = req.body[`fadeOut_${idx}`] === 'true';
//       const speed = Number(req.body[`speed_${idx}`] || 1);
//       return { path: filePaths[idx], start, end, fadeIn, fadeOut, speed };
//     });

//     // Build FFmpeg complex filter
//     let filterChains = [];
//     let filterInputs = '';
//     clips.forEach((clip, i) => {
//       let chain = `[${i}:v]`;
//       let filters = [];

//       // Trimming
//       if (clip.start !== 0 || clip.end !== null) {
//         let trim = `trim=start=${clip.start}`;
//         if (clip.end !== null) trim += `:end=${clip.end}`;
//         filters.push(trim, 'setpts=PTS-STARTPTS');
//       }

//       // Speed adjustment
//       if (clip.speed !== 1) {
//         filters.push(`setpts=${(1 / clip.speed).toFixed(3)}*PTS`);
//       }

//       // Fade in/out
//       if (clip.fadeIn) filters.push('fade=t=in:st=0:d=1');
//       if (clip.fadeOut && clip.end !== null) {
//         filters.push(`fade=t=out:st=${Math.max(0, clip.end - clip.start - 1)}:d=1`);
//       }

//       filters.push('format=yuv420p');

//       chain += filters.join(',');
//       chain += `[v${i}]`;
//       filterChains.push(chain);
//       filterInputs += `[v${i}]`;
//     });

//     filterInputs += `concat=n=${clips.length}:v=1:a=0[outv]`;
//     const filterComplex = [...filterChains, filterInputs].join(';');

//     // Prepare FFmpeg command
//     let ffmpegCmd = ffmpeg();
//     clips.forEach(clip => {
//       ffmpegCmd = ffmpegCmd.addInput(clip.path);
//     });

//     // Output options
//     let resolutionMap = { '480p': 'scale=-2:480', '720p': 'scale=-2:720', '1080p': 'scale=-2:1080' };
//     let outputOptions = ['-map', '[outv]'];

//     // ⚠️ On some Windows ffmpeg builds, faststart causes "Invalid argument"
//     outputOptions.push('-movflags', 'faststart');

//     if (exportResolution !== 'original' && resolutionMap[exportResolution]) {
//       outputOptions.push('-vf', resolutionMap[exportResolution]);
//     }

//     let formatOptions = { mp4: ['-c:v', 'libx264'], webm: ['-c:v', 'libvpx'], mov: ['-c:v', 'prores_ks'] };
//     if (formatOptions[exportFormat]) outputOptions.push(...formatOptions[exportFormat]);

//     ffmpegCmd
//       .complexFilter(filterComplex, ['outv'])
//       .outputOptions(...outputOptions)
//       .output(outputPath) // ✅ no quotes
//       .on('end', () => {
//         console.log('FFmpeg finished, sending file...');
//         res.download(outputPath, () => {
//           filePaths.forEach(p => fs.existsSync(p) && fs.unlinkSync(p));
//           fs.existsSync(outputPath) && fs.unlinkSync(outputPath);
//         });
//       })
//       .on('error', err => {
//         console.error('FFmpeg error:', err.message);
//         res.status(500).json({ error: err.message });
//         filePaths.forEach(p => fs.existsSync(p) && fs.unlinkSync(p));
//         if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
//       })
//       .run();

//   } catch (err) {
//     console.error('Merge error:', err);
//     res.status(500).json({ error: err.message });
//   }
// });

module.exports = router; 