import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

export function getPlatform() {
    return Platform.OS;
}

export async function getDeviceInfo() {
    const version = await DeviceInfo.getVersion();
    const platform = getPlatform();
    return { version, platform };
}
