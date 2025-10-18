const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

function applyEffect(inputPath, { brightness = 0, contrast = 1, saturation = 1, filterType = 'brightness' }){
    return new Promise((resolve, reject) => {
          const outputPath = path.join('uploads', `${Date.now()}-filtered.mp4`);
          
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
                resolve(outputPath);
            })
            .on('error', err => {
              reject(err);
            })
            .run();
    });
}


function applyTextOverlay(inputPath, { text = 'Sample Text', fontSize = 36, fontColor = 'white', x = '(w-text_w)/2', y = '(h-text_h)/2' }) {
    return new Promise((resolve, reject) => {
        const outputPath = path.join('uploads', `${Date.now()}-overlay.mp4`);

        const drawtext = `drawtext=text='${text}':fontcolor=${fontColor}:fontsize=${fontSize}:x=${x}:y=${y}`;

        ffmpeg(inputPath)
            .videoFilters(drawtext)
            .outputOptions('-movflags', 'faststart')
            .output(outputPath)
            .on('end', () => {
              resolve(outputPath);
            })
            .on('error', err => {
               reject(err);
            })
            .run();
    });
}

function applyImageOverlay(inputPath, imagePath, options = {}){
    return new Promise((resolve, reject) => {
        const outputPath = path.join('uploads', `${Date.now()}-img-overlay.mp4`);

        let {x = 10, y = 10, width = 100, height = 100} = options;

        const isNumber = v => v !== '' && !Number.isNaN(Number(v));

        const filters = [];

        if (width || height){
            const scaleW = isNumber(width) ? String(width) : (width || '-1');
            const scaleH = isNumber(height) ? String(height) : (height || '-1');

            if (opacity && !Number.isNaN(Number(opacity))) {
                filters.push(`[1:v] scale=${scaleW}:${scaleH}, format=rgba, colorchannelmixer=aa=${Number(opacity).toFixed(2)} [logo]`);
            } else {
                filters.push(`[1:v] scale=${scaleW}:${scaleH} [logo]`);
            }
            filters.push(`[0:v][logo] overlay=${x}:${y}`);
        } else {
            if (opacity && !Number.isNaN(Number(opacity))) {
                filters.push(`[1:v] format=rgba, colorchannelmixer=aa=${Number(opacity).toFixed(2)} [logo]`);
                filters.push(`[0:v][logo] overlay=${x}:${y}`);
            } else {
                filters.push(`[0:v][1:v] overlay=${x}:${y}`);
            }
        }

        ffmpeg()
              .input(inputPath)
              .input(imagePath)
              .complexFilter(filters)
              .outputOptions(['-movflags', 'faststart'])
              .output(outputPath)
              .on('stderr', line => console.log('FFmpeg stderr:', line))
              .on('end', () => {
                resolve(outputPath);
              })
              .on('error', err => {
                console.error('FFmpeg error:', err);
                // // cleanup uploaded inputs (output may not exist or be partial)
                // [inputPath, imagePath].forEach(p => { try { if (fs.existsSync(p)) fs.unlinkSync(p); } catch(e){} });
                // res.status(500).json({ error: err.message });
                reject(err);
              })
              .run();
    })
}

function muteAudio(inputPath){
    return new Promise((resolve, reject) => {
        const outputPath = path.join('uploads', `${Date.now()}-muted.mp4`);

        ffmpeg(inputPath)
            .noAudio()
            .outputOptions('-movflags', 'faststart')
            .output(outputPath)
            .on('end', () => {
              resolve(outputPath);
            })
            .on('error', err => {
            //   res.status(500).json({ error: err.message });
            //   fs.unlinkSync(inputPath);
            reject(err);
            })
            .run();
    })
}


function replaceAudio(inputPath, audioPath){
    return new Promise((resolve, reject) => {
        const outputPath = path.join('uploads', `${Date.now()}-replaced-audio.mp4`);

        ffmpeg()
            .input(inputPath)
            .input(audioPath)
            .outputOptions(['-map 0:v:0', '-map 1:a:0', '-c:v copy', '-shortest', '-movflags faststart'])
            .output(outputPath)
            .on('end', () => {
                resolve(outputPath);
            })
            .on('stderr', (stderrLine) => {
                reject(new Error(stderrLine));
            })
            .on('error', err => {
              res.status(500).json({ error: err.message });
              fs.unlinkSync(inputPath);
              fs.unlinkSync(audioPath);
            })
            .run();
    })
}


module.exports = { applyEffect, applyTextOverlay, applyImageOverlay, muteAudio, replaceAudio };