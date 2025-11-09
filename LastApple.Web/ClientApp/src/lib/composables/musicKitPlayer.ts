import { getDeveloperToken } from '$lib/services/AppleMusicApi';

let musicKitInstance: MusicKit.MusicKitInstance | null = null;

export async function getMusicKitInstance(): Promise<MusicKit.MusicKitInstance> {
    if (musicKitInstance) {
        return musicKitInstance;
    }
    
    return await initializeMusicKit();
}

export async function initializeMusicKit(): Promise<MusicKit.MusicKitInstance> {
    if (musicKitInstance) {
        return musicKitInstance;
    }
    
    // Get developer token from API
    const developerToken = await getDeveloperToken();
    
    // Configure MusicKit
    await MusicKit.configure({
        developerToken: developerToken,
        app: {
            name: 'LastApple',
            build: '1.0.0'
        }
    });
    
    musicKitInstance = MusicKit.getInstance();
    
    return musicKitInstance;
}
