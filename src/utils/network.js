import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Resolve a development host that works across Expo (web, simulator, device)
 */
export const getDevHost = () => {
  try {
    // New Expo (SDK 49+) manifest2
    const m2Host = Constants?.manifest2?.extra?.expoGo?.developer?.hostname;
    if (m2Host) return m2Host.split(':')[0];

    // Old Expo manifest
    const legacyDebuggerHost = Constants?.manifest?.debuggerHost;
    if (legacyDebuggerHost) return legacyDebuggerHost.split(':')[0];

    // Expo config hostUri
    const hostUri = Constants?.expoConfig?.hostUri;
    if (hostUri) return hostUri.split(':')[0];
  } catch (e) {}
  return 'localhost';
};

/**
 * Build dummy API base URLs (HTTP and WS) with sensible defaults per platform.
 * Honors explicit overrides if provided.
 */
export const getDummyApiUrls = ({ httpOverride, wsOverride } = {}) => {
  if (httpOverride && wsOverride) {
    return { http: httpOverride, ws: wsOverride };
  }

  const host = getDevHost();
  const isAndroid = Platform.OS === 'android';
  const isLocalHost = host === 'localhost' || host === '127.0.0.1';
  // Android emulator cannot reach localhost of host machine
  const resolvedHost = isAndroid && isLocalHost ? '10.0.2.2' : host;

  const http = httpOverride || `http://${resolvedHost}:3001`;
  const ws = wsOverride || `ws://${resolvedHost}:3001`;
  return { http, ws };
};

export default {
  getDevHost,
  getDummyApiUrls,
};


