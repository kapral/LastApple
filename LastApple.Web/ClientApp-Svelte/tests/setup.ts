import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

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

// Mock $app/environment
vi.mock('$app/environment', () => ({
    browser: true,
    building: false,
    dev: true,
    version: 'test'
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
