import environment from "../Environment";

class LastfmApi {
    async getAuthUrl(redirectUrl: string) {
        const encodedUrl = encodeURIComponent(redirectUrl);
        const authUrlResponse = await fetch(`${environment.apiUrl}api/lastfm/auth?redirectUrl=${encodedUrl}`);

        return await authUrlResponse.json();
    }

    async searchArtist(searchTerm: string) {
        const apiResponse = await fetch(`${environment.apiUrl}api/lastfm/artist/search?term=${searchTerm}`);

        return await apiResponse.json();
    }

    async postToken(token: string) {
        return await fetch(`${environment.apiUrl}api/lastfm/auth?token=${token}`, { method: 'POST', headers: { 'X-SessionId': localStorage.getItem('SessionId') } });
    }

    async logout() {
        return await fetch(`${environment.apiUrl}api/lastfm/auth`, { method: 'DELETE', headers: { 'X-SessionId': localStorage.getItem('SessionId') } });
    }

    async getUser() {
        const userResponse = await fetch(`${environment.apiUrl}api/lastfm/auth/user`, { headers: { 'X-SessionId': localStorage.getItem('SessionId') } });
        return await userResponse.json();
    }

    async postNowPlaying(artist: string, song: string) {
        await fetch(`${environment.apiUrl}api/lastfm/nowPlaying?artist=${artist}&song=${song}`, { method: 'POST', headers: { 'X-SessionId': localStorage.getItem('SessionId') } });
    }

    async postScrobble(artist: string, song: string) {
        await fetch(`${environment.apiUrl}api/lastfm/scrobble?artist=${artist}&song=${song}`, { method: 'POST', headers: { 'X-SessionId': localStorage.getItem('SessionId') } });
    }
}

const lastFmApi = new LastfmApi();

export default lastFmApi;