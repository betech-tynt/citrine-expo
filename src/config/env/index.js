import { NativeModules } from 'react-native';
import { API_URL } from '../../constants/utils';

const { EnvConfig } = NativeModules;

// Fallback values
const fallbackConfig = {
    API_URL,
    ENV_NAME: 'staging',
    NAV_BAR_COLOR: '#FF9874',
};

let cachedConfig = null;
let loadPromise = null;

export const ensureEnvLoaded = async () => {
    // If it has already finished loading, return it immediately. (cache).
    if (cachedConfig) {
        return cachedConfig;
    }

    // Avoid making multiple native calls while the app is starting up
    if (!loadPromise) {
        loadPromise = (async () => {
            // If the native module is not linked/does not exist, use fallback.
            if (!EnvConfig) {
                cachedConfig = fallbackConfig;
                return cachedConfig;
            }

            try {
                // Get config from native (Android/iOS), usually mapped from BuildConfig/Info.plist.
                const config = await EnvConfig.getConfig();

                // Merge to always have all keys:
                // - fallbackConfig provides default values
                // - config from native (if any) will override fallback.
                cachedConfig = {
                    ...fallbackConfig,
                    ...(config || {}),
                };
                return cachedConfig;
            } catch (e) {
                // If the native throws an error, log a warning and still run the app with fallback.
                console.warn(
                    'EnvConfig.getConfig failed; using fallback config',
                    e,
                );
                cachedConfig = fallbackConfig;
                return cachedConfig;
            }
        })();
    }

    // Return Promise (still loading) or result after loading is complete.
    return loadPromise;
};

// Eager load on import (best-effort)
ensureEnvLoaded().catch(() => {});

// Sync getters return cached or fallback
const getSync = () => cachedConfig || fallbackConfig;

export const ENV = {
    get API_URL() {
        return getSync().API_URL;
    },
    get ENV_NAME() {
        return getSync().ENV_NAME;
    },
    get NAV_BAR_COLOR() {
        return getSync().NAV_BAR_COLOR;
    },
};
