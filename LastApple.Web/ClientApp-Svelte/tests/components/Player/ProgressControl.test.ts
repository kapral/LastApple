import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';

// Create a shared mock instance
const mockInstance = {
    currentPlaybackDuration: 180,
    currentPlaybackTime: 0,
    playbackState: 0,
    isPlaying: false,
    seekToTime: vi.fn().mockResolvedValue(undefined),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
};

// Mock MusicKit
vi.mock('$lib/services/musicKit', () => ({
    getMusicKitInstance: vi.fn(() => mockInstance),
    formatMediaTime: vi.fn((seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    })
}));

describe('ProgressControl', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset the mock instance spies
        mockInstance.addEventListener = vi.fn();
        mockInstance.removeEventListener = vi.fn();
        mockInstance.seekToTime = vi.fn().mockResolvedValue(undefined);
    });

    it('renders without crashing', async () => {
        const { default: ProgressControl } = await import('$lib/components/Player/ProgressControl.svelte');
        render(ProgressControl);
    });

    it('adds event listener on mount', async () => {
        const { default: ProgressControl } = await import('$lib/components/Player/ProgressControl.svelte');
        render(ProgressControl);

        expect(mockInstance.addEventListener).toHaveBeenCalledWith(
            'playbackTimeDidChange',
            expect.any(Function)
        );
    });

    it('removes event listener on unmount', async () => {
        const { default: ProgressControl } = await import('$lib/components/Player/ProgressControl.svelte');
        const { unmount } = render(ProgressControl);

        unmount();

        expect(mockInstance.removeEventListener).toHaveBeenCalledWith(
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

    it('renders progress bar with correct structure', async () => {
        const { default: ProgressControl } = await import('$lib/components/Player/ProgressControl.svelte');
        const { container } = render(ProgressControl);

        const progressBar = container.querySelector('.audio-progress');
        expect(progressBar).toBeInTheDocument();
        // Verify the progress bar has the expected class (styles come from CSS)
        expect(progressBar).toHaveClass('audio-progress');
    });

    it('shows playing progress bar', async () => {
        const { default: ProgressControl } = await import('$lib/components/Player/ProgressControl.svelte');
        const { container } = render(ProgressControl);

        const playingProgress = container.querySelector('.playing-progress');
        expect(playingProgress).toBeInTheDocument();
    });

    it('seeks to position on click', async () => {
        const { default: ProgressControl } = await import('$lib/components/Player/ProgressControl.svelte');
        const { container } = render(ProgressControl);

        const progressWrapper = container.querySelector('.progress-wrapper') as HTMLElement;

        // First simulate mouse move to set rewindPosition
        Object.defineProperty(progressWrapper, 'getBoundingClientRect', {
            value: () => ({ left: 0, width: 200, top: 0, bottom: 20, height: 20, right: 200 })
        });

        await fireEvent.mouseMove(progressWrapper, { clientX: 100 });
        await fireEvent.mouseUp(progressWrapper, { clientX: 100 });

        expect(mockInstance.seekToTime).toHaveBeenCalled();
    });
});
