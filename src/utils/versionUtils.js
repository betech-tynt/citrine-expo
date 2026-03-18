import * as Application from 'expo-application';
import { ENV } from '../config/env';

/**
 * Get the display version
 * @returns {string} Version string in format "x.x.x (env)"
 */
export const getDisplayVersion = () => {
    const appVersion = Application.nativeApplicationVersion || '1.0.0';
    const envShortMap = {
        staging: 'stg',
        production: 'prd',
    };
    const envName = ENV.ENV_NAME || '';
    const envShort = envShortMap[envName] ?? envName ?? '';

    return envShort ? `${appVersion} (${envShort})` : appVersion;
};
