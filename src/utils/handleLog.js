import { ENV } from '../config/env';

/**
 * Check if current environment is development
 * Based on build.gradle productFlavors:
 * - dev: ENV_NAME = "development"
 * - staging: ENV_NAME = "staging"
 * - production: ENV_NAME = "production"
 * @returns {boolean} True if in development environment
 */
const isDev = () => {
    return true;
    // Check ENV_NAME from config (exact match with build.gradle)
    // return ENV?.ENV_NAME === 'staging';
};

/**
 * Log message only in development environment
 * @param {...any} args - Arguments to log
 */
export const log = (...args) => {
    if (isDev()) {
        console.log(...args);
    }
};

/**
 * Log error only in development environment
 * @param {...any} args - Arguments to log
 */
export const logError = (...args) => {
    if (isDev()) {
        console.error(...args);
    }
};

/**
 * Log warning only in development environment
 * @param {...any} args - Arguments to log
 */
export const logWarn = (...args) => {
    if (isDev()) {
        console.warn(...args);
    }
};

/**
 * Log info only in development environment
 * @param {...any} args - Arguments to log
 */
export const logInfo = (...args) => {
    if (isDev()) {
        console.info(...args);
    }
};
