import lastfmApi from "./restClients/LastfmApi";

class LastfmAuthService {
    async getAuthenticatedUser() {
        return await lastfmApi.getUser();
    }

    async authenticate() {
        window.location.href = await lastfmApi.getAuthUrl(window.location.href);
    }

    private postTokenPromise: Promise<void>;

    async tryGetAuthFromParams() {
        const url = new URL(window.location.href);
        const token = url.searchParams.get('token');

        if (token) {
            await (this.postTokenPromise || (this.postTokenPromise = this.postToken(token)));
            this.postTokenPromise = null;
        }
    }

    async postToken(token: string) {
        const sessionIdResponse = await lastfmApi.postToken(token);
        const sessionId = await sessionIdResponse.json();

        localStorage.setItem('SessionId', sessionId);

        window.history.replaceState({}, document.title, `/${window.location.hash}`);
    }
    
    async logout() {
        await lastfmApi.logout();
    }
}

export default new LastfmAuthService();