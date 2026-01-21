type EnvSource = 'meta' | 'process';

const readMetaEnv = (key: string): string => {
  // @ts-ignore - import.meta.env is provided by Vite at build time.
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
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

  // @ts-ignore - import.meta.env is provided by Vite at build time.
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
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
