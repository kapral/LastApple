import musicApi from "../restClients/AppleMusicApi";
import musicKit from '../musicKit';

class AppleAuthService {
    existingAuthCheckPromise: Promise<boolean>;

    async isAuthenticated() {
        let kit = await musicKit.getInstance();

        if (kit.isAuthorized) {
            return true;
        }

        if (this.existingAuthCheckPromise) {
            return await this.existingAuthCheckPromise;
        }

        let resolve = null;
        this.existingAuthCheckPromise = new Promise<boolean>(r => resolve = r);

        await this.tryGetExistingAuthentication();

        // re-read the instance just so it's easier to mock the changes in tests
        kit = await musicKit.getInstance();

        resolve(kit.isAuthorized);

        return kit.isAuthorized;
    }

    private async tryGetExistingAuthentication() {
        const kit = await musicKit.getInstance();

        let sessionData = await musicApi.getSessionData();

        if (sessionData && sessionData.musicUserToken) {
            // @ts-ignore
            kit.musicUserToken = sessionData.musicUserToken;
            // @ts-ignore
            kit.storefrontId = sessionData.musicStorefrontId;

            localStorage.setItem(`${sessionData.musicUserToken}.s`, sessionData.musicStorefrontId);
        }
    }

    async authenticate() {
        const kit = await musicKit.getInstance();

        await kit.authorize();

        const sessionData = await musicApi.postSessionData({
            musicUserToken: kit.musicUserToken,
            musicStorefrontId: kit.storefrontId
        });

        localStorage.setItem('SessionId', sessionData.id);
    }

    async logout() {
        const kit = await musicKit.getInstance();

        await kit.unauthorize();

        await musicApi.deleteSessionData();
    }
}

const authService = new AppleAuthService();

export default authService;