const ABSOLUTE_URL_PATTERN = /^(?:[a-z]+:)?\/\//i;
const PORT_ONLY_PATTERN = /^:\d+(?:\/.*)?$/;
const DIGITS_ONLY_PATTERN = /^\d+$/;

const stripTrailingSlash = value => value.replace(/\/+$/, '');

const normaliseBaseUrl = (rawValue, fallback) => {
  const fallbackValue = fallback ? stripTrailingSlash(fallback) : fallback;
  if (!rawValue) {
    return fallbackValue;
  }

  const trimmed = rawValue.trim();
  if (!trimmed) {
    return fallbackValue;
  }

  if (ABSOLUTE_URL_PATTERN.test(trimmed)) {
    return stripTrailingSlash(trimmed);
  }

  if (PORT_ONLY_PATTERN.test(trimmed) && typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    return stripTrailingSlash(`${protocol}//${hostname}${trimmed}`);
  }

  if (DIGITS_ONLY_PATTERN.test(trimmed) && typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:${trimmed}`;
  }

  if (trimmed.startsWith('/')) {
    return stripTrailingSlash(trimmed);
  }

  if (typeof window !== 'undefined') {
    try {
      const resolved = new URL(trimmed, window.location.origin);
      return stripTrailingSlash(`${resolved.origin}${resolved.pathname}`);
    } catch (_) {
      // fall through to fallback
    }
  }

  return fallbackValue;
};

const buildUrl = (base, path = '') => {
  const effectivePath = path.startsWith('/') ? path : `/${path}`;

  if (!base) {
    return effectivePath;
  }

  if (ABSOLUTE_URL_PATTERN.test(base)) {
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
    const resolvedBase = base.startsWith('//') ? `${protocol}${base}` : base;
    const baseWithSlash = resolvedBase.endsWith('/') ? resolvedBase : `${resolvedBase}/`;
    const relativePath = effectivePath.replace(/^\//, '');
    return new URL(relativePath || '.', baseWithSlash).toString();
  }

  return `${base}${effectivePath}`.replace(/\/{2,}/g, '/');
};

const API_BASE_URL = normaliseBaseUrl(process.env.REACT_APP_API_URL, 'http://localhost:5000/api/v1');
const MEDIA_BASE_URL = normaliseBaseUrl(process.env.REACT_APP_MEDIA_URL, 'http://localhost:5000');

const handleResponse = async response => {
  if (response.ok) {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return response.json();
    }
    return response.blob();
  }

  try {
    const data = await response.json();
    const message = data?.error?.message || data?.message || response.statusText;
    throw new Error(message);
  } catch (error) {
    throw new Error(response.statusText);
  }
};

export const request = async (path, { method = 'GET', body, headers, isFormData, signal } = {}) => {
  const config = {
    method,
    headers: headers || {},
    mode: 'cors',
    credentials: 'include',
  };

  if (body) {
    if (isFormData) {
      config.body = body;
    } else {
      config.headers['Content-Type'] = 'application/json';
      config.body = JSON.stringify(body);
    }
  }

  if (signal) {
    config.signal = signal;
  }

  const url = buildUrl(API_BASE_URL, path);

  try {
    const response = await fetch(url, config);
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError) {
      const hint = `Unable to reach the media API at ${url}.`;
      const extra = ` Ensure the backend service is running and accessible.`;
      throw new Error(`${hint}${extra}`);
    }
    throw error;
  }
};

export const requestJson = async (path, options = {}) => request(path, options);

export const requestBlob = async (path, options = {}) => {
  const url = buildUrl(API_BASE_URL, path);
  const response = await fetch(url, {
    mode: 'cors',
    credentials: 'include',
    ...options,
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Download failed');
  }
  const blob = await response.blob();
  const disposition = response.headers.get('content-disposition') || '';
  let filename = null;
  if (disposition.includes('filename=')) {
    filename = disposition.split('filename=')[1].replace(/"/g, '');
  }
  return { blob, filename };
};

export const getMediaUrl = relativePath => {
  if (!relativePath) {
    return relativePath;
  }

  if (ABSOLUTE_URL_PATTERN.test(relativePath)) {
    return relativePath;
  }

  return buildUrl(MEDIA_BASE_URL, relativePath);
};

export const __INTERNALS__ = {
  buildUrl,
  normaliseBaseUrl,
};
