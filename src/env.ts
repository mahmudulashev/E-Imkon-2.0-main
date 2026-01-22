type EnvSource = 'meta' | 'process';

const readMetaEnv = (key: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const value = import.meta.env[key];
    return typeof value === 'string' ? value : '';
  }
  return '';
};

const readProcessEnv = (key: string): string => {
  if (typeof process !== 'undefined' && process.env && typeof process.env[key] === 'string') {
    return process.env[key] as string;
  }
  return '';
};

export const getEnv = (key: string): string => readMetaEnv(key) || readProcessEnv(key);

export const getEnvAny = (keys: string[]): string => {
  for (const key of keys) {
    const value = getEnv(key);
    if (value) return value;
  }
  return '';
};

export const listEnvKeys = (source: EnvSource, match: (key: string) => boolean): string[] => {
  if (source === 'process') {
    if (typeof process !== 'undefined' && process.env) {
      return Object.keys(process.env).filter(match);
    }
    return [];
  }

  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return Object.keys(import.meta.env).filter(match);
  }
  return [];
};

export const getSupabaseUrl = (): string =>
  getEnvAny(['VITE_SUPABASE_URL', 'SUPABASE_URL']);

export const getSupabaseAnonKey = (): string =>
  getEnvAny(['VITE_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY']);

export const getGeminiApiKey = (): string =>
  getEnvAny(['VITE_GEMINI_API_KEY', 'VITE_API_KEY', 'GEMINI_API_KEY', 'API_KEY']);

export const getFirebaseApiKey = (): string =>
  getEnvAny(['VITE_FIREBASE_API_KEY', 'FIREBASE_API_KEY']);

export const getFirebaseAuthDomain = (): string =>
  getEnvAny(['VITE_FIREBASE_AUTH_DOMAIN', 'FIREBASE_AUTH_DOMAIN']);

export const getFirebaseProjectId = (): string =>
  getEnvAny(['VITE_FIREBASE_PROJECT_ID', 'FIREBASE_PROJECT_ID']);

export const getFirebaseStorageBucket = (): string =>
  getEnvAny(['VITE_FIREBASE_STORAGE_BUCKET', 'FIREBASE_STORAGE_BUCKET']);

export const getFirebaseMessagingSenderId = (): string =>
  getEnvAny(['VITE_FIREBASE_MESSAGING_SENDER_ID', 'FIREBASE_MESSAGING_SENDER_ID']);

export const getFirebaseAppId = (): string =>
  getEnvAny(['VITE_FIREBASE_APP_ID', 'FIREBASE_APP_ID']);
