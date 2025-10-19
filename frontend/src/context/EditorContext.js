import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import PropTypes from 'prop-types';

import * as mediaApi from '../services/mediaApi';

const EditorContext = createContext(null);

export const EditorProvider = ({ children }) => {
  const [assets, setAssets] = useState([]);
  const [activeAssetId, setActiveAssetId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [lastAssetId, setLastAssetId] = useState(null);
  const [sessionAssetIds, setSessionAssetIds] = useState([]);

  const closeSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  const openSnackbar = useCallback((message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const refreshAssets = useCallback(async (allowedIds) => {
    try {
      const response = await mediaApi.listAssets();
      const ids = allowedIds ?? sessionAssetIds;
      const filtered = ids.length
        ? response.assets.filter(asset => ids.includes(asset.id))
        : [];
      setAssets(filtered);
      setActiveAssetId(prevId => {
        if (!filtered.length) {
          return null;
        }
        if (!prevId || !filtered.some(asset => asset.id === prevId)) {
          return filtered[0].id;
        }
        return prevId;
      });
    } catch (error) {
      openSnackbar(error.message || 'Failed to load assets', 'error');
    }
  }, [openSnackbar, sessionAssetIds]);

  const resetSessionAssets = useCallback(() => {
    setSessionAssetIds([]);
    setLastAssetId(null);
    return [];
  }, []);

  const registerSessionAsset = useCallback((assetId, { reset = false } = {}) => {
    if (!assetId) {
      return reset ? resetSessionAssets() : sessionAssetIds;
    }
    let nextIds = reset ? resetSessionAssets() : sessionAssetIds;
    if (!nextIds.includes(assetId)) {
      nextIds = [...nextIds, assetId];
    }
    setSessionAssetIds(nextIds);
    return nextIds;
  }, [resetSessionAssets, sessionAssetIds]);

  const removeSessionAsset = useCallback(assetId => {
    if (!assetId) return sessionAssetIds;
    const nextIds = sessionAssetIds.filter(id => id !== assetId);
    setSessionAssetIds(nextIds);
    return nextIds;
  }, [sessionAssetIds]);

  const capturePreviousAsset = useCallback(currentId => {
    if (!currentId) return;
    setLastAssetId(currentId);
  }, []);

  const undoLastAsset = useCallback(currentAssetId => {
    const allowedIds = currentAssetId ? removeSessionAsset(currentAssetId) : sessionAssetIds;
    setActiveAssetId(prev => {
      if (!lastAssetId) {
        return prev;
      }
      const target = lastAssetId;
      setLastAssetId(null);
      return target;
    });
    return allowedIds;
  }, [lastAssetId, removeSessionAsset, sessionAssetIds]);

  const value = useMemo(() => ({
    assets,
    setAssets,
    activeAssetId,
    setActiveAssetId,
    loading,
    setLoading,
    statusMessage,
    setStatusMessage,
    snackbar,
    openSnackbar,
    closeSnackbar,
    refreshAssets,
    registerSessionAsset,
    removeSessionAsset,
    capturePreviousAsset,
    resetSessionAssets,
    lastAssetId,
    undoLastAsset,
    sessionAssetIds,
  }), [
    assets,
    activeAssetId,
    loading,
    statusMessage,
    snackbar,
    openSnackbar,
    closeSnackbar,
    refreshAssets,
    registerSessionAsset,
    removeSessionAsset,
    capturePreviousAsset,
    resetSessionAssets,
    lastAssetId,
    undoLastAsset,
    sessionAssetIds,
  ]);

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
};

EditorProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useEditorContext = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditorContext must be used within an EditorProvider');
  }
  return context;
};

export default EditorContext;
