import Constants from 'expo-constants';

// 環境変数から読み込み（.env で EXPO_PUBLIC_API_TUNNEL_URL を設定）
const TUNNEL_URL = process.env.EXPO_PUBLIC_API_TUNNEL_URL ?? '';
const PRODUCTION_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

function getApiBaseUrl(): string {
  if (!__DEV__) {
    return `${PRODUCTION_URL}/api/v1`;
  }

  // ngrok 等のトンネル経由（実機 Expo Go + WSL2 対応）
  if (TUNNEL_URL) {
    return `${TUNNEL_URL}/api/v1`;
  }

  // Expo dev server の hostUri からPCのIPを取得（実機 Expo Go 対応）
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host) {
    return `http://${host}:3000/api/v1`;
  }

  // フォールバック（エミュレータ等）
  return 'http://localhost:3000/api/v1';
}

export const API_BASE_URL = getApiBaseUrl();
