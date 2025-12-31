// Apple Auth Service - handles Apple Music authentication
import musicKitService from './musicKit';
import appleMusicApi from '$lib/api/appleMusicApi';

class AppleAuthService {
    private existingAuthCheckPromise: Promise<boolean> | null = null;

    async isAuthenticated(): Promise<boolean> {
        const kit = await musicKitService.getInstance();

        if (kit?.isAuthorized) {
            return true;
        }

        if (this.existingAuthCheckPromise) {
            return await this.existingAuthCheckPromise;
        }

        let resolve: (value: boolean) => void;
        this.existingAuthCheckPromise = new Promise<boolean>(r => resolve = r);

        await this.tryGetExistingAuthentication();

        // re-read the instance just so it's easier to mock the changes in tests
        const updatedKit = await musicKitService.getInstance();

        resolve!(updatedKit?.isAuthorized ?? false);

        return updatedKit?.isAuthorized ?? false;
    }

    private async tryGetExistingAuthentication(): Promise<void> {
        const kit = await musicKitService.getInstance();
        if (!kit) return;

        const sessionData = await appleMusicApi.getSessionData();

        if (sessionData && sessionData.musicUserToken) {
            // @ts-ignore - MusicKit internal property
            kit.musicUserToken = sessionData.musicUserToken;
            // @ts-ignore - MusicKit internal property
            kit.storefrontId = sessionData.musicStorefrontId;

            localStorage.setItem(`${sessionData.musicUserToken}.s`, sessionData.musicStorefrontId);
        }
    }

    async authenticate(): Promise<void> {
        const kit = await musicKitService.getInstance();
        if (!kit) return;

        await kit.authorize();

        const sessionData = await appleMusicApi.postSessionData({
            musicUserToken: kit.musicUserToken,
            musicStorefrontId: kit.storefrontId
        });

        localStorage.setItem('SessionId', sessionData.id);
    }

    async logout(): Promise<void> {
        const kit = await musicKitService.getInstance();
        if (!kit) return;

        await kit.unauthorize();

        await appleMusicApi.logout();
    }
}

export const appleAuthService = new AppleAuthService();
