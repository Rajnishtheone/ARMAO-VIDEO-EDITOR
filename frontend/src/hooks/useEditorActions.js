import { useCallback } from 'react';

import useEditor from './useEditor';
import * as mediaApi from '../services/mediaApi';

const useEditorActions = () => {
  const {
    setLoading,
    setStatusMessage,
    openSnackbar,
    refreshAssets,
    setActiveAssetId,
    activeAssetId,
    capturePreviousAsset,
    registerSessionAsset,
    resetSessionAssets,
    lastAssetId,
    undoLastAsset,
    sessionAssetIds,
  } = useEditor();

  const runAction = useCallback(async ({
    pending,
    success,
    task,
    recordUndo = false,
    resetSession = false,
    setActive = true,
    registerResult = true,
    refresh = true,
  }) => {
    if (pending) {
      setStatusMessage(pending);
    }
    if (recordUndo && activeAssetId) {
      capturePreviousAsset(activeAssetId);
    }
    setLoading(true);
    try {
      const result = await task();
      let allowedIds = resetSession ? resetSessionAssets() : sessionAssetIds;
      if (registerResult && result?.id) {
        allowedIds = registerSessionAsset(result.id, { reset: resetSession });
      } else if (resetSession) {
        allowedIds = [];
      }
      if (refresh) {
        await refreshAssets(allowedIds);
      }
      if (setActive && result?.id) {
        setActiveAssetId(result.id);
      }
      if (success) {
        openSnackbar(success, 'success');
      }
      return result;
    } catch (error) {
      openSnackbar(error.message || 'Operation failed', 'error');
      throw error;
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  }, [
    setStatusMessage,
    activeAssetId,
    capturePreviousAsset,
    setLoading,
    registerSessionAsset,
    refreshAssets,
    setActiveAssetId,
    openSnackbar,
    sessionAssetIds,
    resetSessionAssets,
  ]);

  const uploadAsset = useCallback(async file => runAction({
    pending: 'Uploading video...',
    success: `${file.name} uploaded`,
    resetSession: true,
    task: async () => mediaApi.uploadAsset(file),
  }), [runAction]);

  const uploadSupportAsset = useCallback(async (file, label = 'asset') => {
    const prettyLabel = label.charAt(0).toUpperCase() + label.slice(1);
    return runAction({
      pending: `Uploading ${label}...`,
      success: `${prettyLabel} uploaded`,
      setActive: false,
      registerResult: false,
      refresh: false,
      task: async () => mediaApi.uploadAsset(file),
    });
  }, [runAction]);

  const uploadAdditionalVideo = useCallback(async file => runAction({
    pending: `Adding ${file.name}...`,
    success: `${file.name} added to session`,
    resetSession: false,
    setActive: false,
    task: async () => mediaApi.uploadAsset(file),
  }), [runAction]);

  const trimAsset = useCallback(async (assetId, payload) => runAction({
    pending: 'Trimming clip...',
    success: 'Trimmed clip created',
    recordUndo: true,
    task: async () => mediaApi.trimAsset(assetId, payload),
  }), [runAction]);

  const applyFilter = useCallback(async (assetId, payload) => runAction({
    pending: 'Applying filter...',
    success: 'Filter applied',
    recordUndo: true,
    task: async () => mediaApi.applyFilter(assetId, payload),
  }), [runAction]);

  const addTextOverlay = useCallback(async (assetId, payload) => runAction({
    pending: 'Rendering text overlay...',
    success: 'Text overlay added',
    recordUndo: true,
    task: async () => mediaApi.addTextOverlay(assetId, payload),
  }), [runAction]);

  const addImageOverlay = useCallback(async (assetId, payload) => runAction({
    pending: 'Rendering image overlay...',
    success: 'Image overlay added',
    recordUndo: true,
    task: async () => mediaApi.addImageOverlay(assetId, payload),
  }), [runAction]);

  const muteAudio = useCallback(async assetId => runAction({
    pending: 'Muting audio...',
    success: 'Audio muted',
    recordUndo: true,
    task: async () => mediaApi.muteAudio(assetId),
  }), [runAction]);

  const replaceAudio = useCallback(async (assetId, payload) => runAction({
    pending: 'Replacing audio...',
    success: 'Audio replaced',
    recordUndo: true,
    task: async () => mediaApi.replaceAudio(assetId, payload),
  }), [runAction]);

  const changeSpeed = useCallback(async (assetId, speed) => runAction({
    pending: speed > 1 ? 'Speeding up clip...' : 'Slowing clip...',
    success: speed > 1 ? 'Faster clip ready' : 'Slow-motion clip ready',
    recordUndo: true,
    task: async () => mediaApi.changeSpeed(assetId, speed),
  }), [runAction]);

  const mergeAssets = useCallback(async (clipIds, format) => runAction({
    pending: 'Merging clips...',
    success: 'Merged clip ready',
    recordUndo: false,
    task: async () => mediaApi.mergeAssets(clipIds, format),
  }), [runAction]);

  const exportVideo = useCallback(async payload => runAction({
    pending: 'Building export...',
    success: 'Export ready',
    recordUndo: false,
    setActive: false,
    task: async () => mediaApi.exportVideo(payload),
  }), [runAction]);

  const downloadAsset = useCallback(async assetId => mediaApi.downloadAsset(assetId), []);

  const undoLast = useCallback(async currentAssetId => {
    if (!lastAssetId) {
      openSnackbar('Nothing to undo yet', 'info');
      return;
    }
    const allowedIds = undoLastAsset(currentAssetId);
    await refreshAssets(allowedIds);
    openSnackbar('Reverted to previous clip', 'success');
  }, [lastAssetId, undoLastAsset, refreshAssets, openSnackbar]);

  return {
    uploadAsset,
    uploadSupportAsset,
    uploadAdditionalVideo,
    trimAsset,
    applyFilter,
    addTextOverlay,
    addImageOverlay,
    muteAudio,
    replaceAudio,
    changeSpeed,
    mergeAssets,
    exportVideo,
    downloadAsset,
    undoLast,
  };
};

export default useEditorActions;
