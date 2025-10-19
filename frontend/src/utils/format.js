export const formatDuration = totalSeconds => {
  if (totalSeconds === undefined || totalSeconds === null || Number.isNaN(totalSeconds)) {
    return '00:00';
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');
  return `${paddedMinutes}:${paddedSeconds}`;
};

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
