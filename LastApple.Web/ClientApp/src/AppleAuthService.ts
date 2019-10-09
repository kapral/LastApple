import musicApi from "./restClients/AppleMusicApi";
import musicKit from './musicKit';

class AppleAuthService {
    async isAuthenticated() {
        const kit = await musicKit.getInstance();

        return kit.isAuthorized;
    }

    async tryGetExistingAuthentication() {
        const kit = await musicKit.getInstance();

        let sessionData = await musicApi.getSessionData();

        if (sessionData && sessionData.musicUserToken) {
            kit.musicUserToken = sessionData.musicUserToken;
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
}

export default new AppleAuthService();