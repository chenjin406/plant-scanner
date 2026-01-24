/**
 * Safely get environment variables across different platforms (Web, MiniApp, Node)
 * @param key The environment variable key
 * @returns The value or undefined
 */
export const getEnv = (key: string): string | undefined => {
  // Try Taro-specific environment first (injected via defineConstants or global process)
  try {
    if (typeof (global as any) !== 'undefined' && (global as any).process?.env?.[key]) {
      return (global as any).process.env[key];
    }
  } catch {}

  // Try global process for web/node/webpack
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch {}

  return undefined;
};

/**
 * Check if the current environment is development
 */
export const isDev = (): boolean => {
  return getEnv('NODE_ENV') === 'development';
};

/**
 * Check if the current environment is production
 */
export const isProd = (): boolean => {
  return getEnv('NODE_ENV') === 'production';
};
