import { Platform } from 'react-native';
import Constants from 'expo-constants';

export function getPlatform() {
    return Platform.OS;
}

export async function getDeviceInfo() {
    const version =
        Constants.expoConfig?.version ||
        Constants.expoConfig?.runtimeVersion ||
        Constants.nativeAppVersion ||
        '1.0.0';
    const platform = getPlatform();
    return { version, platform };
}
