import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Settings from '$lib/components/Settings.svelte';
import { AuthenticationState } from '$lib/services/authentication';

// Mock the stores with different states for different tests
let mockAppleState = AuthenticationState.Unauthenticated;
let mockLastfmState = AuthenticationState.Unauthenticated;

vi.mock('$lib/stores/appleAuth', () => ({
    appleAuthStore: {
        subscribe: vi.fn((callback) => {
            callback({ state: mockAppleState });
            return () => {};
        })
    }
}));

vi.mock('$lib/stores/lastfmAuth', () => ({
    lastfmAuthStore: {
        subscribe: vi.fn((callback) => {
            callback({ 
                state: mockLastfmState, 
                user: mockLastfmState === AuthenticationState.Authenticated 
                    ? { id: 'test-user', name: 'Test User', url: '', avatar: [] } 
                    : null,
                isScrobblingEnabled: true
            });
            return () => {};
        })
    }
}));

describe('Settings', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAppleState = AuthenticationState.Unauthenticated;
        mockLastfmState = AuthenticationState.Unauthenticated;
    });

    it('renders without crashing', () => {
        render(Settings);
    });

    it('shows loading spinner when Apple authentication is loading', () => {
        mockAppleState = AuthenticationState.Loading;
        render(Settings);

        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('shows loading spinner when Last.fm authentication is loading', () => {
        mockLastfmState = AuthenticationState.Loading;
        render(Settings);

        expect(screen.getByRole('status')).toBeInTheDocument();
    });
});
