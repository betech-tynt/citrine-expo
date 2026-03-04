import Constants from 'expo-constants';
import { ENV } from '../config/env';

/**
 * Get the display version
 * @returns {string} Version string in format "x.x.x (env)"
 */
export const getDisplayVersion = () => {
    const appVersion =
        Constants.expoConfig?.version ||
        Constants.expoConfig?.runtimeVersion ||
        Constants.nativeAppVersion ||
        '1.0.0';
    const envShortMap = {
        staging: 'stg',
        production: 'prd',
    };
    const envName = ENV.ENV_NAME || '';
    const envShort = envShortMap[envName] ?? envName ?? '';

    return envShort ? `${appVersion} (${envShort})` : appVersion;
};
