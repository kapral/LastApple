import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import { readable } from 'svelte/store';

// Mock $env/dynamic/public
vi.mock('$env/dynamic/public', () => ({
    env: {
        PUBLIC_API_BASE_URL: 'http://localhost:5000'
    }
}));

// Mock $app/navigation
vi.mock('$app/navigation', () => ({
    goto: vi.fn(),
    invalidate: vi.fn(),
    invalidateAll: vi.fn(),
    preloadData: vi.fn(),
    preloadCode: vi.fn(),
    afterNavigate: vi.fn(),
    beforeNavigate: vi.fn(),
    onNavigate: vi.fn()
}));

// Mock $app/stores
vi.mock('$app/stores', () => ({
    page: readable({
        url: new URL('http://localhost:5173/'),
        params: {},
        route: { id: '/' },
        status: 200,
        error: null,
        data: {},
        form: null
    }),
    navigating: readable(null),
    updated: readable(false)
}));

// Mock $app/environment
vi.mock('$app/environment', () => ({
    browser: true,
    building: false,
    dev: true,
    version: 'test'
}));

// Create a mock MusicKit instance for reuse
const mockMusicKitInstance = {
    isAuthorized: false,
    authorize: vi.fn().mockResolvedValue(undefined),
    unauthorize: vi.fn().mockResolvedValue(undefined),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    nowPlayingItem: null,
    isPlaying: false,
    currentPlaybackDuration: 180,
    currentPlaybackTime: 0,
    seekToTime: vi.fn().mockResolvedValue(undefined),
    api: {
        music: vi.fn()
    }
};

// Mock musicKitService
vi.mock('$lib/services/musicKit', () => ({
    default: {
        getInstance: vi.fn().mockResolvedValue(mockMusicKitInstance),
        formatMediaTime: vi.fn((seconds: number) => {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }),
        instance: mockMusicKitInstance
    },
    getMusicKitInstance: vi.fn(() => mockMusicKitInstance),
    formatMediaTime: vi.fn((seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    })
}));

// Mock appleMusicApi
vi.mock('$lib/api/appleMusicApi', () => ({
    default: {
        getSessionData: vi.fn().mockResolvedValue(null),
        postSessionData: vi.fn().mockResolvedValue({ id: 'test-session-id' }),
        deleteSessionData: vi.fn().mockResolvedValue(undefined)
    },
    getSessionData: vi.fn().mockResolvedValue(null),
    postSessionData: vi.fn().mockResolvedValue({ id: 'test-session-id' }),
    deleteSessionData: vi.fn().mockResolvedValue(undefined)
}));

// Mock window.MusicKit globally for tests
(global as any).window = global.window || {};
(global.window as any).MusicKit = {
    configure: vi.fn().mockResolvedValue({
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        nowPlayingItem: null,
        isPlaying: false
    }),
    formatMediaTime: vi.fn((seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    })
};

// Mock AudioContext
global.AudioContext = vi.fn().mockImplementation(() => ({
    state: 'running'
})) as any;
