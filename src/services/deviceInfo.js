import * as Application from 'expo-application';
import { Platform } from 'react-native';

export function getPlatform() {
    return Platform.OS;
}

export async function getDeviceInfo() {
    const version = Application.nativeApplicationVersion || '1.0.0';
    const platform = getPlatform();
    return { version, platform };
}

export async function getUniqueId() {
    if (Platform.OS === 'android') {
        return Application.getAndroidId();
    } else if (Platform.OS === 'ios') {
        try {
            return await Application.getIosIdForVendorAsync();
        } catch (e) {
            return 'unknown';
        }
    } else {
        return 'unknown';
    }
}
