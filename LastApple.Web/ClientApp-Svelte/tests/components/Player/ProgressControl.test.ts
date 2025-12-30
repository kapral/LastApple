import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';

// Mock MusicKit
vi.mock('$lib/services/musicKit', () => ({
    getMusicKitInstance: vi.fn(() => ({
        currentPlaybackDuration: 180,
        currentPlaybackTime: 0,
        playbackState: 0,
        isPlaying: false,
        seekToTime: vi.fn().mockResolvedValue(undefined),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
    })),
    formatMediaTime: vi.fn((seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    })
}));

describe('ProgressControl', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders without crashing', async () => {
        const { default: ProgressControl } = await import('$lib/components/Player/ProgressControl.svelte');
        render(ProgressControl);
    });

    it('adds event listener on mount', async () => {
        const mockMusicKit = await import('$lib/services/musicKit');
        const instance = mockMusicKit.getMusicKitInstance();

        const { default: ProgressControl } = await import('$lib/components/Player/ProgressControl.svelte');
        render(ProgressControl);

        expect(instance.addEventListener).toHaveBeenCalledWith(
            'playbackTimeDidChange',
            expect.any(Function)
        );
    });

    it('removes event listener on unmount', async () => {
        const mockMusicKit = await import('$lib/services/musicKit');
        const instance = mockMusicKit.getMusicKitInstance();

        const { default: ProgressControl } = await import('$lib/components/Player/ProgressControl.svelte');
        const { unmount } = render(ProgressControl);

        unmount();

        expect(instance.removeEventListener).toHaveBeenCalledWith(
            'playbackTimeDidChange',
            expect.any(Function)
        );
    });

    it('displays formatted current time', async () => {
        const mockMusicKit = await import('$lib/services/musicKit');
        vi.mocked(mockMusicKit.formatMediaTime).mockReturnValue('0:00');

        const { default: ProgressControl } = await import('$lib/components/Player/ProgressControl.svelte');
        render(ProgressControl);

        expect(mockMusicKit.formatMediaTime).toHaveBeenCalledWith(0);
        const timeElements = screen.getAllByText('0:00');
        expect(timeElements.length).toBeGreaterThan(0);
    });

    it('displays formatted total duration', async () => {
        const mockMusicKit = await import('$lib/services/musicKit');
        vi.mocked(mockMusicKit.formatMediaTime).mockReturnValue('3:00');

        const { default: ProgressControl } = await import('$lib/components/Player/ProgressControl.svelte');
        render(ProgressControl);

        expect(mockMusicKit.formatMediaTime).toHaveBeenCalledWith(180);
    });

    it('renders progress bar with correct styling', async () => {
        const { default: ProgressControl } = await import('$lib/components/Player/ProgressControl.svelte');
        const { container } = render(ProgressControl);

        const progressBar = container.querySelector('.audio-progress');
        expect(progressBar).toBeInTheDocument();
        expect(progressBar).toHaveStyle({
            width: '100%',
            cursor: 'pointer'
        });
    });

    it('shows playing progress bar', async () => {
        const { default: ProgressControl } = await import('$lib/components/Player/ProgressControl.svelte');
        const { container } = render(ProgressControl);

        const playingProgress = container.querySelector('.playing-progress');
        expect(playingProgress).toBeInTheDocument();
    });

    it('seeks to position on click', async () => {
        const mockMusicKit = await import('$lib/services/musicKit');
        const instance = mockMusicKit.getMusicKitInstance();

        const { default: ProgressControl } = await import('$lib/components/Player/ProgressControl.svelte');
        const { container } = render(ProgressControl);

        const progressBar = container.querySelector('.audio-progress') as HTMLElement;

        // Simulate click at 50% position
        Object.defineProperty(progressBar, 'offsetWidth', { value: 200 });
        Object.defineProperty(progressBar, 'getBoundingClientRect', {
            value: () => ({ left: 0, width: 200 })
        });

        await fireEvent.click(progressBar, { clientX: 100 });

        expect(instance.seekToTime).toHaveBeenCalled();
    });
});
