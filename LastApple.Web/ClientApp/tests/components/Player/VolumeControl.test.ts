import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';

const mockMusicKitInstance = {
    volume: 1,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
};

vi.mock('$lib/services/musicKit', () => ({
    default: {
        getExistingInstance: vi.fn(() => mockMusicKitInstance)
    }
}));

describe('VolumeControl', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockMusicKitInstance.volume = 1;
    });

    it('renders without crashing', async () => {
        const { default: VolumeControl } = await import('$lib/components/Player/VolumeControl.svelte');
        render(VolumeControl);
    });

    it('renders volume control container', async () => {
        const { default: VolumeControl } = await import('$lib/components/Player/VolumeControl.svelte');
        const { container } = render(VolumeControl);

        expect(container.querySelector('.volume-control')).toBeInTheDocument();
    });

    it('renders volume button', async () => {
        const { default: VolumeControl } = await import('$lib/components/Player/VolumeControl.svelte');
        render(VolumeControl);

        const volumeButton = screen.getByRole('button', { name: /mute/i });
        expect(volumeButton).toBeInTheDocument();
    });

    it('toggles mute when volume button is clicked', async () => {
        const { default: VolumeControl } = await import('$lib/components/Player/VolumeControl.svelte');
        render(VolumeControl);

        const volumeButton = screen.getByRole('button', { name: /mute/i });
        await fireEvent.click(volumeButton);

        expect(mockMusicKitInstance.volume).toBe(0);
    });

    it('renders volume slider', async () => {
        const { default: VolumeControl } = await import('$lib/components/Player/VolumeControl.svelte');
        const { container } = render(VolumeControl);

        expect(container.querySelector('.volume-slider')).toBeInTheDocument();
    });

    it('updates volume when slider is changed', async () => {
        const { default: VolumeControl } = await import('$lib/components/Player/VolumeControl.svelte');
        const { container } = render(VolumeControl);

        const slider = container.querySelector('.volume-slider') as HTMLInputElement;
        await fireEvent.input(slider, { target: { value: '0.5' } });

        expect(mockMusicKitInstance.volume).toBe(0.5);
    });
});
