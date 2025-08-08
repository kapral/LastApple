import environment from "../Environment";

export interface ILastfmUser {
    readonly name: string;
    readonly url: string;
    readonly avatar: Array<string>
}

interface ScrobbleRequest {
    artist: string;
    song: string;
    album?: string;
    durationInMillis?: number;
}

interface NowPlayingRequest {
    artist: string;
    song: string;
    album?: string;
    durationInMillis?: number;
}

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

    async getUser(): Promise<ILastfmUser> {
        const userResponse = await fetch(`${environment.apiUrl}api/lastfm/auth/user`, { headers: { 'X-SessionId': localStorage.getItem('SessionId') } });
        return await userResponse.json();
    }

    async postNowPlaying(artist: string, song: string, album?: string, durationInMillis?: number) {
        const requestBody: NowPlayingRequest = { artist, song };
        if (album) {
            requestBody.album = album;
        }
        if (durationInMillis) {
            requestBody.durationInMillis = durationInMillis;
        }
        
        await fetch(`${environment.apiUrl}api/lastfm/nowPlaying`, { 
            method: 'POST', 
            headers: { 
                'X-SessionId': localStorage.getItem('SessionId'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
    }

    async postScrobble(artist: string, song: string, album?: string, durationInMillis?: number) {
        const requestBody: ScrobbleRequest = { artist, song };
        if (album) {
            requestBody.album = album;
        }
        if (durationInMillis) {
            requestBody.durationInMillis = durationInMillis;
        }
        
        await fetch(`${environment.apiUrl}api/lastfm/scrobble`, { 
            method: 'POST', 
            headers: { 
                'X-SessionId': localStorage.getItem('SessionId'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
    }
}

const lastFmApi = new LastfmApi();

export default lastFmApi;