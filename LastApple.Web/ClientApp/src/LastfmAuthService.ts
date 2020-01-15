import lastfmApi from "./restClients/LastfmApi";

class LastfmAuthService {
    async getAuthenticatedUser() {
        return await lastfmApi.getUser();
    }

    async authenticate() {
        const authUrl = await lastfmApi.getAuthUrl(window.location.href);

        window.location.href = authUrl;
    }

    async tryGetAuthFromParams() {
        const url = new URL(window.location.href);
        const token = url.searchParams.get('token');

        if (token) {
            const sessionIdResponse = await lastfmApi.postToken(token);
            const sessionId = await sessionIdResponse.json();

            localStorage.setItem('SessionId', sessionId);

            window.history.replaceState({}, document.title, `/${window.location.hash}`);
        }
    }
    
    async logout() {
        await lastfmApi.logout();
    }
}

export default new LastfmAuthService();