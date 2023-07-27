import lastfmApi from "../restClients/LastfmApi";

class LastfmAuthService {
    public async getAuthenticatedUser() {
        return await lastfmApi.getUser();
    }

    public async authenticate() {
        window.location.href = await lastfmApi.getAuthUrl(window.location.href);
    }

    public tryGetAuthFromParams(): string | null {
        const url = new URL(window.location.href);
        return url.searchParams.get('token');
    }

    public async postToken(token: string) {
        const sessionIdResponse = await lastfmApi.postToken(token);
        const sessionId = await sessionIdResponse.json();

        localStorage.setItem('SessionId', sessionId);

        window.history.replaceState({}, document.title, `/${window.location.hash}`);
    }

    public async logout() {
        await lastfmApi.logout();
    }
}

const lastFmAuthService = new LastfmAuthService();

export default lastFmAuthService;