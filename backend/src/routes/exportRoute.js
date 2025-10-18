const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const os = require('os');

const { applyEffect, applyTextOverlay, applyImageOverlay, muteAudio, replaceAudio } = require('../utils/applyFilter');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/export', upload.fields([{ name: 'video' }, { name: 'image' }, { name: 'audio' }]), async (req, res) => {
    try {
        const inputPath = req.files.video;
        let imagePath = null;
        let audioPath = null;

        if (req.files.image){
            imagePath = req.files.image;
        }
        if (req.files.audio){
            audioPath = req.files.audio;
        }
        const effects = req.body.effects ? JSON.parse(req.body.effects) : [];

        
        let tempVidPath = inputPath;

        // Add Effect Filter
        if (effects.effectFilter &&
            effects.effectFilter.filterType !== undefined && effects.effectFilter.filterType !== '' &&
            effects.effectFilter.brightness !== undefined && effects.effectFilter.brightness !== '' &&
            effects.effectFilter.contrast !== undefined && effects.effectFilter.contrast !== '' &&
            effects.effectFilter.saturation !== undefined && effects.effectFilter.saturation !== ''
        ){
            console.log("Applying effect filter:", effects.effectFilter);
            tempVidPath = await applyEffect(inputPath, effects.effectFilter);
        }

        // Add Text Overlays

        if (effects.textOverlay &&
            effects.textOverlay.text !== undefined && effects.textOverlay.text !== '' &&
            effects.textOverlay.fontSize !== undefined && effects.textOverlay.fontSize !== '' &&
            effects.textOverlay.fontColor !== undefined && effects.textOverlay.fontColor !== '' &&
            effects.textOverlay.x !== undefined && effects.textOverlay.x !== '' &&
            effects.textOverlay.y !== undefined && effects.textOverlay.y !== '' &&
            effects.textOverlay.width !== undefined && effects.textOverlay.width !== '' &&
            effects.textOverlay.height !== undefined && effects.textOverlay.height !== ''
        ){
            console.log("Applying text overlay:", effects.textOverlay);
            tempVidPath = await applyTextOverlay(tempVidPath, effects.textOverlay);
        }

        // Add Image Overlay

        if (imagePath){
            if (effects.imageOverlay &&
                effects.imageOverlay.x !== undefined && effects.imageOverlay.x !== '' &&
                effects.imageOverlay.y !== undefined && effects.imageOverlay.y !== '' &&
                effects.imageOverlay.width !== undefined && effects.imageOverlay.width !== '' &&
                effects.imageOverlay.height !== undefined && effects.imageOverlay.height !== '' &&
                effects.imageOverlay.opacity !== undefined && effects.imageOverlay.opacity !== ''
            ){
                console.log("Applying image overlay:", effects.imageOverlay);
                tempVidPath = await applyImageOverlay(tempVidPath, imagePath, effects.imageOverlay);
            }
        }

        // Mute Audio
        if (effects.mute){
            console.log("Muting audio");
            tempVidPath = await muteAudio(tempVidPath);
        }

        // Replace Audio
        if (audioPath){
            console.log("Replacing audio with:", audioPath);
            tempVidPath = await replaceAudio(tempVidPath, audioPath);
        }

        res.download(tempVidPath, () => {
            try {
                if (fs.existsSync(tempVidPath)) fs.unlinkSync(tempVidPath);
            }catch(e) {}
        })

    }catch(e){
        console.error('Export error:', e);
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;