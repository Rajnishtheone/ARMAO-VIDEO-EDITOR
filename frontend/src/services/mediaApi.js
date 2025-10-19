import { requestJson, requestBlob, getMediaUrl } from './apiClient';

export const uploadAsset = async file => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await requestJson('/media/assets', {
    method: 'POST',
    body: formData,
    isFormData: true,
  });
  return response.asset;
};

export const listAssets = async () => requestJson('/media/assets');

export const getAsset = async assetId => requestJson(`/media/assets/${assetId}`);

export const trimAsset = async (assetId, payload) => {
  const response = await requestJson(`/media/assets/${assetId}/trim`, {
    method: 'POST',
    body: payload,
  });
  return response.asset;
};

export const applyFilter = async (assetId, payload) => {
  const response = await requestJson(`/media/assets/${assetId}/filter`, {
    method: 'POST',
    body: payload,
  });
  return response.asset;
};

export const addTextOverlay = async (assetId, payload) => {
  const response = await requestJson(`/media/assets/${assetId}/text-overlays`, {
    method: 'POST',
    body: payload,
  });
  return response.asset;
};

export const addImageOverlay = async (assetId, payload) => {
  const response = await requestJson(`/media/assets/${assetId}/image-overlays`, {
    method: 'POST',
    body: payload,
  });
  return response.asset;
};

export const muteAudio = async assetId => {
  const response = await requestJson(`/media/assets/${assetId}/audio/mute`, {
    method: 'POST',
  });
  return response.asset;
};

export const replaceAudio = async (assetId, payload) => {
  const response = await requestJson(`/media/assets/${assetId}/audio/replace`, {
    method: 'POST',
    body: payload,
  });
  return response.asset;
};

export const changeSpeed = async (assetId, speed) => {
  const response = await requestJson(`/media/assets/${assetId}/speed`, {
    method: 'POST',
    body: { speed },
  });
  return response.asset;
};

export const mergeAssets = async (clipIds, format) => {
  const response = await requestJson('/media/actions/merge', {
    method: 'POST',
    body: { clipIds, format },
  });
  return response.asset;
};

export const exportVideo = async payload => {
  const response = await requestJson('/media/actions/export', {
    method: 'POST',
    body: payload,
  });
  return response.asset;
};

export const downloadAsset = async assetId => {
  const { blob, filename } = await requestBlob(`/media/assets/${assetId}/download`);
  const objectUrl = window.URL.createObjectURL(blob);
  return { url: objectUrl, filename };
};

export const buildMediaUrl = relativePath => getMediaUrl(relativePath);
