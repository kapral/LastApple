import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

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
