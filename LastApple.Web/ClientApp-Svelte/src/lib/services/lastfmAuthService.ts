// Last.fm Auth Service - handles Last.fm authentication
import * as lastfmApi from '$lib/api/lastfmApi';
import type { ILastfmUser } from '$lib/stores/lastfmAuth';

class LastfmAuthService {
    async getAuthenticatedUser(): Promise<ILastfmUser | undefined> {
        try {
            return await lastfmApi.getUser();
        } catch {
            return undefined;
        }
    }

    async authenticate(): Promise<void> {
        const authUrl = await lastfmApi.getAuthUrl(window.location.href);
        window.location.href = authUrl;
    }

    tryGetAuthFromParams(): string | null {
        const url = new URL(window.location.href);
        return url.searchParams.get('token');
    }

    async postToken(token: string): Promise<void> {
        const sessionId = await lastfmApi.postToken(token);

        localStorage.setItem('SessionId', sessionId);

        window.history.replaceState({}, document.title, `/${window.location.hash}`);
    }

    async logout(): Promise<void> {
        await lastfmApi.logout();
    }
}

export const lastfmAuthService = new LastfmAuthService();
