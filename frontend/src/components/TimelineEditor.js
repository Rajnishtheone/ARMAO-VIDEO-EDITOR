import React from 'react';
import { Card, CardContent, Typography, Grid, TextField, Slider, Switch, Button, Select, MenuItem, FormControl, InputLabel, Box, IconButton } from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';

export default function TimelineEditor({
  timelineClips,
  setTimelineClips,
  exportFormat,
  setExportFormat,
  exportResolution,
  setExportResolution,
  timelineStatus,
  timelineMergedURL,
  handleTimelineFiles,
  handleTimelineChange,
  moveTimelineClip,
  handleTimelineMerge
}) {
  return (
    <Box sx={{ mt: 6, pt: 3, borderTop: '2px solid #333' }}>
      <Typography variant="h4" gutterBottom>Timeline Editor</Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Cut, move, reorder clips, add effects, and export your timeline.
      </Typography>
      <Button
        variant="contained"
        component="label"
        sx={{ mb: 2 }}
      >
        Upload Clips
        <input
          accept="video/*"
          type="file"
          multiple
          hidden
          onChange={handleTimelineFiles}
        />
      </Button>
      {timelineClips.length > 0 && (
        <Box>
          {timelineClips.map((clip, idx) => (
            <Card variant="outlined" sx={{ mb: 1 }} key={idx}>
              <CardContent>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
                  <Typography variant="subtitle2" sx={{ minWidth: 120 }}>{clip.name}</Typography>
                  <TextField
                    label="Start (s)"
                    type="number"
                    size="small"
                    value={clip.start}
                    onChange={e => handleTimelineChange(idx, 'start', Number(e.target.value))}
                    inputProps={{ min: 0 }}
                    sx={{ width: 80 }}
                  />
                  <TextField
                    label="End (s)"
                    type="number"
                    size="small"
                    value={clip.end === null ? '' : clip.end}
                    onChange={e => handleTimelineChange(idx, 'end', e.target.value === '' ? null : Number(e.target.value))}
                    inputProps={{ min: clip.start }}
                    sx={{ width: 80 }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2">Fade In</Typography>
                    <Switch
                      checked={clip.fadeIn}
                      onChange={e => handleTimelineChange(idx, 'fadeIn', e.target.checked)}
                      color="primary"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2">Fade Out</Typography>
                    <Switch
                      checked={clip.fadeOut}
                      onChange={e => handleTimelineChange(idx, 'fadeOut', e.target.checked)}
                      color="primary"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2">Speed</Typography>
                    <Slider
                      value={clip.speed}
                      min={0.25}
                      max={4}
                      step={0.05}
                      onChange={(_, val) => handleTimelineChange(idx, 'speed', val)}
                      valueLabelDisplay="auto"
                      sx={{ width: 100 }}
                    />
                  </Box>
                  <Box display="flex" flexDirection="column">
                    <IconButton
                      size="small"
                      disabled={idx === 0}
                      onClick={() => moveTimelineClip(idx, -1)}
                    >
                      <ArrowUpward />
                    </IconButton>
                    <IconButton
                      size="small"
                      disabled={idx === timelineClips.length - 1}
                      onClick={() => moveTimelineClip(idx, 1)}
                    >
                      <ArrowDownward />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
      <Box sx={{ mt: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Format</InputLabel>
          <Select
            value={exportFormat}
            label="Format"
            onChange={e => setExportFormat(e.target.value)}
          >
            <MenuItem value="mp4">MP4</MenuItem>
            <MenuItem value="webm">WebM</MenuItem>
            <MenuItem value="mov">MOV</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Resolution</InputLabel>
          <Select
            value={exportResolution}
            label="Resolution"
            onChange={e => setExportResolution(e.target.value)}
          >
            <MenuItem value="original">Original</MenuItem>
            <MenuItem value="480p">480p</MenuItem>
            <MenuItem value="720p">720p</MenuItem>
            <MenuItem value="1080p">1080p</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" color="success" onClick={handleTimelineMerge} sx={{ height: 56 }}>
          Merge Timeline
        </Button>
      </Box>
      {timelineStatus && <Typography sx={{ mt: 1 }} color="info.main"><strong>{timelineStatus}</strong></Typography>}
      {timelineMergedURL && (
        <Box sx={{ mt: 2 }}>
          <video src={timelineMergedURL} controls width="480" style={{ border: '1px solid #4caf50', borderRadius: 8 }} />
          <a href={timelineMergedURL} download={`timeline-merged.${exportFormat}`}>
            <Button variant="outlined" color="success" sx={{ mt: 1 }}>Download Timeline Video</Button>
          </a>
        </Box>
      )}
    </Box>
  );
} 