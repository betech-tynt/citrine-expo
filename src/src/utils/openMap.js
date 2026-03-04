import { Linking } from 'react-native';

export async function openMapByQuery(query) {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        query,
    )}`;

    const supported = await Linking.canOpenURL(url);
    if (supported) {
        await Linking.openURL(url);
        return true;
    }
    // Fallback: try open anyway
    await Linking.openURL(url);
    return true;
}
